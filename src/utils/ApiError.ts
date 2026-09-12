/**
 * Custom operational error class for consistent API error handling.
 *
 * Extends the native Error with HTTP status codes, structured field-level
 * errors, and an `isOperational` flag to distinguish expected failures
 * (bad input, auth, not-found) from unexpected crashes.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: Array<{ field?: string; message: string }>;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: Array<{ field?: string; message: string }> = [],
    isOperational: boolean = true,
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /** 400 Bad Request */
  static badRequest(message: string, errors: Array<{ field?: string; message: string }> = []) {
    return new ApiError(400, message, errors);
  }

  /** 401 Unauthorized */
  static unauthorized(message: string = 'Authentication required') {
    return new ApiError(401, message);
  }

  /** 403 Forbidden */
  static forbidden(message: string = 'Access denied') {
    return new ApiError(403, message);
  }

  /** 404 Not Found */
  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message);
  }

  /** 409 Conflict */
  static conflict(message: string = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message: string = 'Too many requests, please try again later') {
    return new ApiError(429, message);
  }

  /** 500 Internal Server Error (non-operational by default) */
  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}

