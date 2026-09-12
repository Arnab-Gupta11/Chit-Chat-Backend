import { Request, Response } from 'express';
import * as messageService from '../services/message.service';
import { asyncHandler } from '../utils/asyncHandler';
import { apiResponse } from '../utils/ApiResponse';

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const { content, type, replyTo } = req.body;
  const userId = req.user!._id.toString();

  const result = await messageService.sendMessage(
    conversationId,
    userId,
    content,
    type,
    replyTo
  );

  return apiResponse(res, 201, 'Message sent successfully', result);
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const userId = req.user!._id.toString();
  const cursor = (req.query.cursor as string) || undefined;
  const limit = req.query.limit ? parseInt((req.query.limit as string), 10) : undefined;

  const result = await messageService.getMessages(conversationId, userId, cursor as string | undefined, limit);

  return apiResponse(res, 200, 'Messages retrieved successfully', { messages: result.messages }, result.meta);
});

export const searchMessages = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const userId = req.user!._id.toString();
  const q = (req.query.q as string);
  const page = req.query.page ? parseInt((req.query.page as string), 10) : undefined;
  const limit = req.query.limit ? parseInt((req.query.limit as string), 10) : undefined;

  const result = await messageService.searchMessages(conversationId, userId, q, page, limit);

  return apiResponse(res, 200, 'Messages searched successfully', { messages: result.messages }, result.meta);
});

export const editMessage = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.messageId as string;
  const { content } = req.body;
  const userId = req.user!._id.toString();

  const message = await messageService.editMessage(messageId, userId, content);

  return apiResponse(res, 200, 'Message edited successfully', { message });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.messageId as string;
  const userId = req.user!._id.toString();

  const message = await messageService.deleteMessage(messageId, userId);

  return apiResponse(res, 200, 'Message deleted successfully', { message });
});

export const addReaction = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.messageId as string;
  const { emoji } = req.body;
  const userId = req.user!._id.toString();

  const message = await messageService.addReaction(messageId, userId, emoji);

  return apiResponse(res, 200, 'Reaction added successfully', { message });
});

export const removeReaction = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.messageId as string;
  const userId = req.user!._id.toString();

  const message = await messageService.removeReaction(messageId, userId);

  return apiResponse(res, 200, 'Reaction removed successfully', { message });
});

export const forwardMessage = asyncHandler(async (req: Request, res: Response) => {
  const messageId = req.params.messageId as string;
  const { conversationId } = req.body;
  const userId = req.user!._id.toString();

  const result = await messageService.forwardMessage(messageId, userId, conversationId);

  return apiResponse(res, 201, 'Message forwarded successfully', result);
});
