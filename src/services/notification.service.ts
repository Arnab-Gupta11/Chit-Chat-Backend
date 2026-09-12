// @ts-nocheck
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import type { NotificationType } from '../utils/constants';

/**
 * Creates a notification if the recipient's preferences allow it.
 */
export const createNotification = async (data: {
  recipient: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: { conversation?: string; message?: string; sender?: string };
}) => {
  const user = await User.findById(data.recipient);
  if (!user) {
    throw new ApiError(404, 'Recipient not found');
  }

  const prefs = user.notificationPreferences;
  let shouldNotify = true;

  if (data.type === 'new_message' || data.type === 'mention') {
    if (data.type === 'new_message' && prefs?.messages === false) shouldNotify = false;
    if (data.type === 'mention' && prefs?.mentions === false) shouldNotify = false;
  }
  if (data.type === 'group_invite' || data.type === 'group_update') {
    if (prefs?.groupUpdates === false) shouldNotify = false;
  }

  if (!shouldNotify) {
    return null;
  }

  let notification = await Notification.create(data);
  notification = await notification.populate('data.sender', 'name avatar');

  return notification;
};

/**
 * Gets notifications for a user with cursor-based pagination.
 */
export const getNotifications = async (userId: string, cursor?: string, limit: number = 20) => {
  const query: any = { recipient: userId };
  if (cursor) {
    query._id = { $lt: cursor };
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate('data.sender', 'name avatar')
    .populate('data.conversation', 'name type');

  const hasMore = notifications.length > limit;
  if (hasMore) {
    notifications.pop();
  }
  
  const nextCursor = notifications.length > 0 ? notifications[notifications.length - 1]._id : null;

  return { notifications, meta: { hasMore, nextCursor, limit } };
};

/**
 * Gets the count of unread notifications for a user.
 */
export const getUnreadCount = async (userId: string) => {
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount };
};

/**
 * Marks a specific notification as read.
 */
export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.isRead) {
    return notification;
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Marks all unread notifications for a user as read.
 */
export const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { modifiedCount: result.modifiedCount };
};

/**
 * Deletes a specific notification.
 */
export const deleteNotification = async (notificationId: string, userId: string) => {
  const result = await Notification.deleteOne({ _id: notificationId, recipient: userId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Notification not found');
  }
};

/**
 * Gets a user's notification preferences.
 */
export const getPreferences = async (userId: string) => {
  const user = await User.findById(userId).select('notificationPreferences');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user.notificationPreferences;
};

/**
 * Updates a user's notification preferences.
 */
export const updatePreferences = async (
  userId: string,
  preferences: { messages?: boolean; mentions?: boolean; groupUpdates?: boolean }
) => {
  const updateData: any = {};
  if (preferences.messages !== undefined) updateData['notificationPreferences.messages'] = preferences.messages;
  if (preferences.mentions !== undefined) updateData['notificationPreferences.mentions'] = preferences.mentions;
  if (preferences.groupUpdates !== undefined) updateData['notificationPreferences.groupUpdates'] = preferences.groupUpdates;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, select: 'notificationPreferences' }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.notificationPreferences;
};
