import type { Response } from 'express';

interface PaginationMeta {
  total?: number;
  limit?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
  page?: number;
}

interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Send a standardized JSON response.
 *
 * @example
 * // Simple success
 * apiResponse(res, 200, 'User fetched', { user });
 *
 * // With pagination meta
 * apiResponse(res, 200, 'Messages loaded', { messages }, { total: 100, hasMore: true, nextCursor: '...' });
 */
export function apiResponse<T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data: T = {} as T,
  meta?: PaginationMeta
): Response {
  const payload: ApiResponsePayload<T> = {
    success: statusCode < 400,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

