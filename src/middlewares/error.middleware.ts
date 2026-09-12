import type { NextFunction, Request, Response } from 'express';
import { config } from '../config';
import { logger } from '../config/logger';
import { ApiError } from '../utils/ApiError';

/**
 * Global error handler middleware.
 *
 * Catches all errors forwarded via `next(error)`, normalizes them
 * into a consistent response format, and logs details.
 *
 * Must be registered AFTER all routes:
 *   app.use(errorHandler);
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ApiError;

  // ── Already an ApiError ───────────────────
  if (err instanceof ApiError) {
    error = err;
  }

  // ── Mongoose CastError (invalid ObjectId) ─
  else if (err.name === 'CastError') {
    error = ApiError.badRequest('Invalid resource ID format');
  }

  // ── Mongoose ValidationError ──────────────
  else if (err.name === 'ValidationError') {
    const mongooseErr = err as unknown as {
      errors: Record<string, { message: string }>;
    };
    const fieldErrors = Object.entries(mongooseErr.errors).map(
      ([field, detail]) => ({
        field,
        message: detail.message,
      })
    );
    error = ApiError.badRequest('Validation failed', fieldErrors);
  }

  // ── Mongoose duplicate key (code 11000) ───
  else if ((err as unknown as { code?: number }).code === 11000) {
    const keyValue = (err as unknown as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    error = ApiError.conflict(`Duplicate value for '${field}'. This ${field} already exists.`);
  }

  // ── JWT errors ────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token has expired');
  }

  // ── Multer errors ─────────────────────────
  else if (err.name === 'MulterError') {
    const multerErr = err as unknown as { code: string };
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File is too large',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
      LIMIT_FILE_COUNT: 'Too many files',
    };
    error = ApiError.badRequest(messages[multerErr.code] || 'File upload error');
  }

  // ── Unknown / unexpected errors ───────────
  else {
    error = ApiError.internal(err.message || 'Internal server error');
  }

  // ── Log the error ─────────────────────────
  if (error.statusCode >= 500) {
    logger.error(`[${error.statusCode}] ${error.message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`[${error.statusCode}] ${error.message}`);
  }

  // ── Send response ─────────────────────────
  const response: Record<string, unknown> = {
    success: false,
    message: error.message,
  };

  if (error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Include stack trace only in development
  if (config.env === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

