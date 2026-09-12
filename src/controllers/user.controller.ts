import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { apiResponse } from '../utils/ApiResponse';
import * as userService from '../services/user.service';

/**
 * Get current user profile
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const user = await userService.getCurrentUser(req.user._id.toString());
  return apiResponse(res, 200, 'Current user fetched successfully', user);
});

/**
 * Get user profile by id
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const user = await userService.getUserById(req.params.userId as string, req.user._id.toString());
  return apiResponse(res, 200, 'User profile fetched successfully', user);
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const user = await userService.updateProfile(req.user._id.toString(), req.body);
  return apiResponse(res, 200, 'Profile updated successfully', user);
});

/**
 * Update user avatar
 */
export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const user = await userService.updateAvatar(req.user._id.toString(), req.file);
  return apiResponse(res, 200, 'Avatar updated successfully', user);
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  // @ts-ignore
  await userService.changePassword(req.user._id.toString(), currentPassword, newPassword);
  return apiResponse(res, 200, 'Password changed successfully');
});

/**
 * Search users
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.q as string);
  const page = parseInt((req.query.page as string), 10) || 1;
  const limit = parseInt((req.query.limit as string), 10) || 10;
  
  // @ts-ignore
  const result = await userService.searchUsers(query, req.user._id.toString(), page, limit);
  return apiResponse(res, 200, 'Users fetched successfully', { users: result.users }, result.meta);
});

/**
 * Block user
 */
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  await userService.blockUser(req.user._id.toString(), req.params.userId);
  return apiResponse(res, 200, 'User blocked successfully');
});

/**
 * Unblock user
 */
export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  await userService.unblockUser(req.user._id.toString(), req.params.userId);
  return apiResponse(res, 200, 'User unblocked successfully');
});

/**
 * Get blocked users
 */
export const getBlockedUsers = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const users = await userService.getBlockedUsers(req.user._id.toString());
  return apiResponse(res, 200, 'Blocked users fetched successfully', { users });
});
