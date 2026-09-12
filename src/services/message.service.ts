import mongoose from 'mongoose';
import { Message } from '../models/message.model';
import { Conversation } from '../models/conversation.model';
import { ApiError } from '../utils/ApiError';
import { MESSAGE_TYPES } from '../utils/constants';
import type { MessageType, ReactionEmoji } from '../utils/constants';
import type { IMessageDocument } from '../types';

/**
 * Send a new message in a conversation
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: MessageType = 'text',
  replyTo?: string
): Promise<{ message: IMessageDocument; conversation: any }> => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.user.toString() === senderId
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }

  if (replyTo) {
    const replyMessage = await Message.findOne({ _id: replyTo, conversation: conversationId });
    if (!replyMessage) {
      throw new ApiError(404, 'Replied message not found in this conversation');
    }
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    type,
    replyTo,
  });

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: message._id,
      $inc: { 'metadata.totalMessages': 1 },
      updatedAt: new Date(),
    },
    { new: true }
  );

  await message.populate('sender', 'name avatar');
  if (replyTo) {
    await message.populate({
      path: 'replyTo',
      select: 'content sender type',
      populate: { path: 'sender', select: 'name avatar' },
    });
  }

  return { message, conversation: updatedConversation };
};

/**
 * Get messages from a conversation with cursor-based pagination
 */
export const getMessages = async (
  conversationId: string,
  userId: string,
  cursor?: string,
  limit: number = 20
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.user.toString() === userId
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }

  const query: any = { conversation: conversationId, isDeleted: false };
  if (cursor) {
    query._id = { $lt: cursor };
  }

  const maxLimit = Math.min(limit, 100);
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(maxLimit + 1)
    .populate('sender', 'name avatar')
    .populate({
      path: 'replyTo',
      select: 'content sender type',
      populate: { path: 'sender', select: 'name avatar' },
    });

  const hasMore = messages.length > maxLimit;
  if (hasMore) {
    messages.pop();
  }

  const nextCursor = hasMore ? messages[messages.length - 1]._id.toString() : null;

  return {
    messages,
    meta: {
      limit: maxLimit,
      hasMore,
      nextCursor,
    },
  };
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  userId: string,
  content: string
): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.sender.toString() !== userId) {
    throw new ApiError(403, 'Can only edit your own messages');
  }

  if (message.isDeleted) {
    throw new ApiError(400, 'Cannot edit a deleted message');
  }

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate('sender', 'name avatar');
  return message;
};

/**
 * Delete a message
 */
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.sender.toString() !== userId) {
    throw new ApiError(403, 'Can only delete your own messages');
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = '[Message deleted]';
  await message.save();

  const conversation = await Conversation.findById(message.conversation);
  if (conversation && conversation.lastMessage?.toString() === messageId) {
    const previousMessage = await Message.findOne({
      conversation: message.conversation,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    conversation.lastMessage = previousMessage ? (previousMessage._id as mongoose.Types.ObjectId) : undefined;
    await conversation.save();
  }

  await message.populate('sender', 'name avatar');
  return message;
};

/**
 * Add a reaction to a message
 */
export const addReaction = async (
  messageId: string,
  userId: string,
  emoji: ReactionEmoji
): Promise<IMessageDocument> => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.user.toString() === userId
  );

  if (existingReactionIndex > -1) {
    if (message.reactions[existingReactionIndex].emoji === emoji) {
      return message; // Idempotent
    }
    // Remove existing different reaction
    message.reactions.splice(existingReactionIndex, 1);
  }

  // Use save() instead of $push to let Mongoose handle validation properly
  message.reactions.push({
    user: new mongoose.Types.ObjectId(userId),
    emoji,
    createdAt: new Date(),
  });
  await message.save();

  await message.populate('sender', 'name avatar');
  await message.populate('reactions.user', 'name avatar');
  return message;
};

/**
 * Remove a reaction from a message
 */
export const removeReaction = async (
  messageId: string,
  userId: string
): Promise<IMessageDocument> => {
  const message = await Message.findOneAndUpdate(
    { _id: messageId },
    { $pull: { reactions: { user: userId } } },
    { new: true }
  );

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  await message.populate('sender', 'name avatar');
  await message.populate('reactions.user', 'name avatar');
  return message;
};

/**
 * Forward a message
 */
export const forwardMessage = async (
  messageId: string,
  userId: string,
  targetConversationId: string
): Promise<{ message: IMessageDocument; conversation: any }> => {
  const originalMessage = await Message.findById(messageId);
  if (!originalMessage) {
    throw new ApiError(404, 'Original message not found');
  }

  const targetConversation = await Conversation.findById(targetConversationId);
  if (!targetConversation) {
    throw new ApiError(404, 'Target conversation not found');
  }

  const isParticipant = targetConversation.participants.some(
    (p) => p.user.toString() === userId
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in the target conversation');
  }

  const newMessage = await Message.create({
    conversation: targetConversationId,
    sender: userId,
    content: originalMessage.content,
    type: originalMessage.type,
    forwardedFrom: {
      message: messageId,
      conversation: originalMessage.conversation,
      sender: originalMessage.sender,
    },
  });

  const updatedTargetConversation = await Conversation.findByIdAndUpdate(
    targetConversationId,
    {
      lastMessage: newMessage._id,
      $inc: { 'metadata.totalMessages': 1 },
      updatedAt: new Date(),
    },
    { new: true }
  );

  await newMessage.populate('sender', 'name avatar');
  await newMessage.populate('forwardedFrom.sender', 'name avatar');

  return { message: newMessage, conversation: updatedTargetConversation };
};

/**
 * Search messages in a conversation
 */
export const searchMessages = async (
  conversationId: string,
  userId: string,
  query: string,
  page: number = 1,
  limit: number = 20
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.user.toString() === userId
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }

  const skip = (page - 1) * limit;

  const searchQuery = {
    conversation: new mongoose.Types.ObjectId(conversationId),
    isDeleted: false,
    $text: { $search: query },
  };

  const [messages, total] = await Promise.all([
    Message.find(searchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar'),
    Message.countDocuments(searchQuery),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    messages,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
};
