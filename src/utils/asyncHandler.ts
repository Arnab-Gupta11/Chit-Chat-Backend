import type { NextFunction, Request, Response } from 'express';

/**
 * Wraps an async Express route handler to automatically catch
 * rejected promises and forward them to the error middleware.
 *
 * Note: Express 5 handles async errors natively, but this wrapper
 * adds explicitness and works consistently across Express versions.
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

