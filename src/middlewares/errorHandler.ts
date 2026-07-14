import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { sendError } from '../utils/response';
import { AppError } from '../utils/errors';
import { Prisma } from '../../generated/prisma/client';
import { env } from '../config/env';



export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error({ err, url: req.url, method: req.method }, 'Error occurred');

  // Zod 4 validation errors — issues (was errors in v3)
  if (err instanceof ZodError) {
    const message = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    sendError(res, 'Validation failed', 400, message);
    return;
  }

  // Custom app errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma errors — Prisma 7 import from generated path
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        sendError(res, 'Resource already exists', 409, 'Unique constraint violation');
        return;
      case 'P2025':
        sendError(res, 'Resource not found', 404);
        return;
      case 'P2003':
        sendError(res, 'Related resource not found', 400, 'Foreign key constraint failed');
        return;
      default:
        sendError(res, 'Database error', 500);
        return;
    }
  }

  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  const error = env.NODE_ENV === 'development' ? err.stack : undefined;
  sendError(res, message, 500, error);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.url} not found`, 404);
};
