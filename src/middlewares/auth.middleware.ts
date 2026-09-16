import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/token.utils';

/**
 * Authentication middleware — verifies the JWT access token from the
 * Authorization header and attaches the user document to `req.user`.
 *
 * Usage:
 *   router.get('/profile', authenticate, getProfile);
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // 1. Extract token from cookies
    const token = req.cookies?.accessToken;

    if (!token) {
      throw ApiError.unauthorized('Access token is missing');
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    // 3. Find user and attach to request
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    req.user = user;
    next();
  }
);

