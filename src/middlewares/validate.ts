import type { Request, Response, NextFunction } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';
import { sendBadRequest } from '../utils/response';


interface ValidateSchema {
  body?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
  params?: ZodObject<ZodRawShape>;
}

export const validate =
  (schema: ValidateSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query) as typeof req.query;
      if (schema.params) {
        const parsed = schema.params.parse(req.params) as Record<string, string>;
        req.params = parsed;
      }
      next();
    } catch (err: unknown) {
      const zodErr = err as { issues?: Array<{ path: string[]; message: string }> };
      if (zodErr.issues) {
        const message = zodErr.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        sendBadRequest(res, 'Validation failed', message);
        return;
      }
      next(err);
    }
  };
