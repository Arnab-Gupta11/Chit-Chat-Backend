import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiResponse } from '../utils/ApiResponse';
import * as conversationService from '../services/conversation.service';
import { ConversationType, Role } from '../utils/constants';

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const { type, participants, name } = req.body;
  const userId = req.user!._id.toString();
  const conversation = await conversationService.createConversation(
    userId,
    type as ConversationType,
    participants,
    name
  );
  return apiResponse(res, 201, 'Conversation created successfully', conversation);
});

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const cursor = (req.query.cursor as string) || undefined;
  const limit = req.query.limit ? parseInt((req.query.limit as string), 10) : undefined;
  
  const result = await conversationService.getUserConversations(userId, cursor, limit);
  return apiResponse(res, 200, 'Conversations fetched successfully', { conversations: result.conversations }, result.meta);
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const conversation = await conversationService.getConversationById(conversationId, userId);
  return apiResponse(res, 200, 'Conversation fetched successfully', conversation);
});

export const updateConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const { name } = req.body;
  const conversation = await conversationService.updateConversation(conversationId, userId, { name });
  return apiResponse(res, 200, 'Conversation updated successfully', conversation);
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  await conversationService.deleteConversation(conversationId, userId);
  return apiResponse(res, 200, 'Conversation deleted successfully');
});

export const addMembers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const { members } = req.body;
  const conversation = await conversationService.addMembers(conversationId, userId, members);
  return apiResponse(res, 200, 'Members added successfully', conversation);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const targetUserId = req.params.userId as string;
  const conversation = await conversationService.removeMember(conversationId, userId, targetUserId);
  return apiResponse(res, 200, 'Member removed successfully', conversation);
});

export const changeMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const targetUserId = req.params.userId as string;
  const { role } = req.body;
  const conversation = await conversationService.changeMemberRole(
    conversationId,
    userId,
    targetUserId,
    role as Role
  );
  return apiResponse(res, 200, 'Member role changed successfully', conversation);
});

export const leaveConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const conversation = await conversationService.leaveConversation(conversationId, userId);
  return apiResponse(res, 200, 'Left conversation successfully', conversation);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  await conversationService.markAsRead(conversationId, userId);
  return apiResponse(res, 200, 'Conversation marked as read successfully');
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const conversationId = req.params.conversationId as string;
  const result = await conversationService.getUnreadCount(conversationId, userId);
  return apiResponse(res, 200, 'Unread count fetched successfully', result);
});
