// @ts-nocheck
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.utils';

/**
 * Register a new user
 */
export const register = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already exists');
  }

  const user = await User.create({ name, email, password }) as any; //({ name, email, password });

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken
  };
};

/**
 * Login a user
 */
export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    user: user.toPublicProfile(),
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || !decoded.userId) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || !user.refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isTokenValid) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

/**
 * Logout a user
 */
export const logout = async (userId: string) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
};
