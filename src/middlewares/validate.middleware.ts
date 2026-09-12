import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware that runs after express-validator checks.
 *
 * Collects any validation errors and throws an ApiError(400)
 * with structured field-level error details.
 *
 * Usage:
 *   router.post('/register',
 *     registerValidator,   // array of check() chains
 *     validate,            // this middleware
 *     authController.register
 *   );
 */
export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const fieldErrors = errors.array().map((err) => ({
    field: 'path' in err ? err.path : 'unknown',
    message: err.msg as string,
  }));

  throw ApiError.badRequest('Validation failed', fieldErrors);
};

