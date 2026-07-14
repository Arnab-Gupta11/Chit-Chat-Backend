import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Express 5 — async errors automatically propagate to error middleware
// এই wrapper টা Express 4 compatibility এর জন্য রাখা হয়েছে
// Express 5 তে async route handlers এ try/catch ছাড়াই error propagate হয়
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
