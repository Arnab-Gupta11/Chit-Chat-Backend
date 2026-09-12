import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload extends JwtPayload {
  userId: string;
}

/**
 * Generate a short-lived access token (default 15m).
 */
export function generateAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiry as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, config.jwt.accessSecret, options);
}

/**
 * Generate a long-lived refresh token (default 7d).
 */
export function generateRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiry as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, config.jwt.refreshSecret, options);
}

/**
 * Verify and decode an access token.
 * @throws JsonWebTokenError | TokenExpiredError
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
}

/**
 * Verify and decode a refresh token.
 * @throws JsonWebTokenError | TokenExpiredError
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
}
