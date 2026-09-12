import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';

/**
 * Get current user
 */
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user.toPublicProfile();
};

/**
 * Get user by id
 */
export const getUserById = async (userId: string, requestingUserId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  if (user.blockedUsers && user.blockedUsers.includes(requestingUserId as any)) {
    throw new ApiError(403, 'You are blocked by this user');
  }
  
  return user.toPublicProfile();
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, updates: { name?: string; bio?: string }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  return user.toPublicProfile();
};

/**
 * Update user avatar
 */
export const updateAvatar = async (userId: string, file: Express.Multer.File | undefined) => {
  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  user.avatar = {
    url: `/uploads/${file.filename}`,
    publicId: file.filename
  };
  
  await user.save();
  return user.toPublicProfile();
};

/**
 * Change password
 */
export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  
  user.password = newPassword;
  await user.save();
};

/**
 * Search users
 */
export const searchUsers = async (query: string, currentUserId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const filter = {
    $text: { $search: query },
    _id: { $ne: currentUserId },
    blockedUsers: { $ne: currentUserId }
  };
  
  const [users, total] = await Promise.all([
    User.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .exec(),
    User.countDocuments(filter)
  ]);
  
  return {
    users: users.map(user => user.toPublicProfile()),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total
    }
  };
};

/**
 * Block user
 */
export const blockUser = async (userId: string, targetUserId: string) => {
  if (userId === targetUserId) {
    throw new ApiError(400, 'Cannot block yourself');
  }
  
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  if (user.blockedUsers && user.blockedUsers.includes(targetUserId as any)) {
    throw new ApiError(409, 'User is already blocked');
  }
  
  await User.findByIdAndUpdate(userId, {
    $addToSet: { blockedUsers: targetUserId }
  });
};

/**
 * Unblock user
 */
export const unblockUser = async (userId: string, targetUserId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  if (!user.blockedUsers || !user.blockedUsers.includes(targetUserId as any)) {
    throw new ApiError(400, 'User is not blocked');
  }
  
  await User.findByIdAndUpdate(userId, {
    $pull: { blockedUsers: targetUserId }
  });
};

/**
 * Get blocked users
 */
export const getBlockedUsers = async (userId: string) => {
  const user = await User.findById(userId).populate('blockedUsers', 'name email avatar');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  return user.blockedUsers;
};
