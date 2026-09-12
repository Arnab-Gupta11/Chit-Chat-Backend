import mongoose from 'mongoose';
import { Conversation } from '../models/conversation.model';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { ApiError } from '../utils/ApiError';
import { CONVERSATION_TYPES, ROLES, GROUP_LIMITS } from '../utils/constants';
import type { ConversationType, Role } from '../utils/constants';
import type { IConversationDocument } from '../types';

const populateOptions = [
  { path: 'participants.user', select: 'name email avatar isOnline lastSeen' },
  { path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } }
];

export const createConversation = async (
  userId: string,
  type: ConversationType,
  participants: string[],
  name?: string
) => {
  if (type === CONVERSATION_TYPES.DIRECT) {
    if (participants.length !== 1) {
      throw new ApiError(400, 'Direct conversations must have exactly one other participant');
    }

    const otherUserId = participants[0];
    
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      throw new ApiError(404, 'Participant user not found');
    }

    const existingConversation = await Conversation.findOne({
      type: CONVERSATION_TYPES.DIRECT,
      isActive: true,
      $and: [
        { 'participants.user': userId },
        { 'participants.user': otherUserId }
      ]
    }).populate(populateOptions);

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation = await Conversation.create({
      type: CONVERSATION_TYPES.DIRECT,
      participants: [
        { user: userId, role: ROLES.MEMBER },
        { user: otherUserId, role: ROLES.MEMBER }
      ],
      createdBy: userId,
      isActive: true
    });

    return await Conversation.findById(newConversation._id).populate(populateOptions);
  } else if (type === CONVERSATION_TYPES.GROUP) {
    if (!name) {
      throw new ApiError(400, 'Group conversations must have a name');
    }

    const participantSet = new Set(participants);
    participantSet.add(userId);
    const allParticipantIds = Array.from(participantSet);

    if (allParticipantIds.length > GROUP_LIMITS.MAX_MEMBERS) {
      throw new ApiError(400, `Group conversations cannot exceed ${GROUP_LIMITS.MAX_MEMBERS} members`);
    }

    const usersCount = await User.countDocuments({ _id: { $in: allParticipantIds } });
    if (usersCount !== allParticipantIds.length) {
      throw new ApiError(400, 'One or more participant users do not exist');
    }

    const newConversation = await Conversation.create({
      type: CONVERSATION_TYPES.GROUP,
      name,
      participants: allParticipantIds.map(id => ({
        user: id,
        role: id === userId ? ROLES.ADMIN : ROLES.MEMBER
      })),
      createdBy: userId,
      isActive: true
    });

    return await Conversation.findById(newConversation._id).populate(populateOptions);
  }

  throw new ApiError(400, 'Invalid conversation type');
};

export const getUserConversations = async (userId: string, cursor?: string, limit: number = 20) => {
  const query: any = {
    'participants.user': userId,
    isActive: true
  };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const conversations = await Conversation.find(query)
    .sort({ updatedAt: -1 })
    .limit(limit + 1)
    .populate(populateOptions)
    .lean();

  let hasMore = false;
  let nextCursor = null;

  if (conversations.length > limit) {
    hasMore = true;
    conversations.pop();
  }

  if (conversations.length > 0) {
    nextCursor = conversations[conversations.length - 1]._id.toString();
  }

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv: any) => {
      const participant = conv.participants.find((p: any) => p.user._id.toString() === userId);
      const lastReadAt = participant?.lastReadAt || new Date(0);

      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        createdAt: { $gt: lastReadAt }
      });

      return { ...conv, unreadCount };
    })
  );

  return {
    conversations: conversationsWithUnread,
    meta: {
      hasMore,
      nextCursor
    }
  };
};

export const getConversationById = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.user': userId
  }).populate(populateOptions);

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  return conversation;
};

export const updateConversation = async (conversationId: string, userId: string, updates: { name?: string }) => {
  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': userId });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  if (conversation.type !== CONVERSATION_TYPES.GROUP) {
    throw new ApiError(400, 'Can only update group conversations');
  }

  const participant = conversation.participants.find(p => p.user.toString() === userId);
  if (participant?.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only admins can update group info');
  }

  if (updates.name) {
    conversation.name = updates.name;
  }

  await conversation.save();
  return await Conversation.findById(conversationId).populate(populateOptions);
};

export const addMembers = async (conversationId: string, userId: string, memberIds: string[]) => {
  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': userId });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  if (conversation.type !== CONVERSATION_TYPES.GROUP) {
    throw new ApiError(400, 'Can only add members to group conversations');
  }

  const requester = conversation.participants.find(p => p.user.toString() === userId);
  if (requester?.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only admins can add members');
  }

  const validUsers = await User.countDocuments({ _id: { $in: memberIds } });
  if (validUsers !== memberIds.length) {
    throw new ApiError(400, 'One or more user IDs are invalid');
  }

  const existingUserIds = new Set(conversation.participants.map(p => p.user.toString()));
  const newMemberIds = memberIds.filter(id => !existingUserIds.has(id));

  if (newMemberIds.length === 0) {
    throw new ApiError(400, 'All specified users are already in the conversation');
  }

  if (conversation.participants.length + newMemberIds.length > GROUP_LIMITS.MAX_MEMBERS) {
    throw new ApiError(400, `Cannot exceed maximum of ${GROUP_LIMITS.MAX_MEMBERS} group members`);
  }

  const newParticipants = newMemberIds.map(id => ({
    user: new mongoose.Types.ObjectId(id) as any,
    role: ROLES.MEMBER
  }));

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $push: { participants: { $each: newParticipants } } },
    { new: true }
  ).populate(populateOptions);

  return updatedConversation;
};

export const removeMember = async (conversationId: string, userId: string, targetUserId: string) => {
  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': userId });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  if (conversation.type !== CONVERSATION_TYPES.GROUP) {
    throw new ApiError(400, 'Can only remove members from group conversations');
  }

  const requester = conversation.participants.find(p => p.user.toString() === userId);
  const target = conversation.participants.find(p => p.user.toString() === targetUserId);

  if (!target) {
    throw new ApiError(400, 'Target user is not in the conversation');
  }

  if (requester?.role !== ROLES.ADMIN && userId !== targetUserId) {
    throw new ApiError(403, 'Only admins can remove other members');
  }

  const adminCount = conversation.participants.filter(p => p.role === ROLES.ADMIN).length;
  if (target.role === ROLES.ADMIN && adminCount === 1) {
    throw new ApiError(400, 'Cannot remove the last admin');
  }

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { $pull: { participants: { user: targetUserId } } },
    { new: true }
  ).populate(populateOptions);

  if (updatedConversation && updatedConversation.participants.length === 0) {
    updatedConversation.isActive = false;
    await updatedConversation.save();
  }

  return updatedConversation;
};

export const leaveConversation = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': userId });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  if (conversation.type === CONVERSATION_TYPES.GROUP) {
    const participant = conversation.participants.find(p => p.user.toString() === userId);
    
    const admins = conversation.participants.filter(p => p.role === ROLES.ADMIN);
    if (participant?.role === ROLES.ADMIN && admins.length === 1 && conversation.participants.length > 1) {
      const nextMember = conversation.participants.find(p => p.user.toString() !== userId);
      if (nextMember) {
        await Conversation.updateOne(
          { _id: conversationId, 'participants.user': nextMember.user },
          { $set: { 'participants.$.role': ROLES.ADMIN } }
        );
      }
    }
  }

  return removeMember(conversationId, userId, userId);
};

export const changeMemberRole = async (conversationId: string, userId: string, targetUserId: string, role: Role) => {
  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': userId });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  if (conversation.type !== CONVERSATION_TYPES.GROUP) {
    throw new ApiError(400, 'Can only change roles in group conversations');
  }

  const requester = conversation.participants.find(p => p.user.toString() === userId);
  if (requester?.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only admins can change roles');
  }

  const target = conversation.participants.find(p => p.user.toString() === targetUserId);
  if (!target) {
    throw new ApiError(400, 'Target user is not in the conversation');
  }

  const updatedConversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, 'participants.user': targetUserId },
    { $set: { 'participants.$.role': role } },
    { new: true }
  ).populate(populateOptions);

  return updatedConversation;
};

export const deleteConversation = async (conversationId: string, userId: string): Promise<void> => {
  const conversation = await Conversation.findOne({ _id: conversationId, 'participants.user': userId });

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  if (conversation.type === CONVERSATION_TYPES.GROUP) {
    const requester = conversation.participants.find(p => p.user.toString() === userId);
    if (requester?.role !== ROLES.ADMIN) {
      throw new ApiError(403, 'Only admins can delete a group conversation');
    }
  }

  conversation.isActive = false;
  await conversation.save();
};

export const markAsRead = async (conversationId: string, userId: string): Promise<void> => {
  const result = await Conversation.updateOne(
    { _id: conversationId, 'participants.user': userId },
    { $set: { 'participants.$.lastReadAt': Date.now() } }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, 'Conversation not found');
  }
};

export const getUnreadCount = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findOne(
    { _id: conversationId, 'participants.user': userId },
    { 'participants.$': 1 }
  );

  if (!conversation || conversation.participants.length === 0) {
    throw new ApiError(404, 'Conversation not found');
  }

  const lastReadAt = conversation.participants[0].lastReadAt || new Date(0);

  const unreadCount = await Message.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    createdAt: { $gt: lastReadAt }
  });

  return { unreadCount };
};
