import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiResponse } from '../utils/ApiResponse';
import * as notificationService from '../services/notification.service';

/**
 * Get notifications for the current user
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const cursor = (req.query.cursor as string) || undefined;
  const limit = req.query.limit ? parseInt((req.query.limit as string), 10) : 20;
  // @ts-ignore
  const userId = req.user._id.toString();

  const result = await notificationService.getNotifications(userId, cursor as string | undefined, limit);
  return apiResponse(res, 200, 'Notifications fetched successfully', result);
});

/**
 * Get unread notification count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id.toString();
  const result = await notificationService.getUnreadCount(userId);
  return apiResponse(res, 200, 'Unread count fetched successfully', result);
});

/**
 * Mark a specific notification as read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = req.params.notificationId as string;
  // @ts-ignore
  const userId = req.user._id.toString();
  const notification = await notificationService.markAsRead(notificationId, userId);
  return apiResponse(res, 200, 'Notification marked as read', { notification });
});

/**
 * Mark all unread notifications as read
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id.toString();
  const result = await notificationService.markAllAsRead(userId);
  return apiResponse(res, 200, 'All notifications marked as read', result);
});

/**
 * Delete a notification
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = req.params.notificationId as string;
  // @ts-ignore
  const userId = req.user._id.toString();
  await notificationService.deleteNotification(notificationId, userId);
  return apiResponse(res, 204, 'Notification deleted successfully');
});

/**
 * Get notification preferences
 */
export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id.toString();
  const preferences = await notificationService.getPreferences(userId);
  return apiResponse(res, 200, 'Preferences fetched successfully', { preferences });
});

/**
 * Update notification preferences
 */
export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id.toString();
  const { messages, mentions, groupUpdates } = req.body;
  const preferences = await notificationService.updatePreferences(userId, { messages, mentions, groupUpdates });
  return apiResponse(res, 200, 'Preferences updated successfully', { preferences });
});
