import type { Document, FilterQuery, Model } from 'mongoose';

// ──────────────────────────────────────────────
// Cursor-based pagination
// ──────────────────────────────────────────────

export interface CursorPaginationOptions {
  /** The cursor value (typically the _id of the last item) */
  cursor?: string | null;
  /** Number of items to return (default 20, max 100) */
  limit?: number;
  /** Sort direction — 'older' loads older items, 'newer' loads newer ones */
  direction?: 'older' | 'newer';
  /** Field to use for cursor (default '_id') */
  cursorField?: string;
}

export interface CursorPaginationResult<T> {
  data: T[];
  meta: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

/**
 * Perform cursor-based pagination on a Mongoose query.
 *
 * Ideal for infinite-scroll lists (messages, conversations, notifications)
 * where offset-based pagination would give inconsistent results as new
 * items are inserted.
 */
export async function paginateWithCursor<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  options: CursorPaginationOptions = {},
  sortField: string = 'createdAt',
  populateFields?: string | string[]
): Promise<CursorPaginationResult<T>> {
  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const direction = options.direction || 'older';

  // Build cursor filter
  const cursorFilter: FilterQuery<T> = { ...filter };
  if (options.cursor) {
    const operator = direction === 'older' ? '$lt' : '$gt';
    (cursorFilter as Record<string, unknown>)[options.cursorField || '_id'] = {
      [operator]: options.cursor,
    };
  }

  // Sort direction
  const sortOrder = direction === 'older' ? -1 : 1;

  // Query with limit + 1 to check if there are more items
  let query = model
    .find(cursorFilter)
    .sort({ [sortField]: sortOrder, _id: sortOrder } as Record<string, 1 | -1>)
    .limit(limit + 1);

  if (populateFields) {
    const fields = Array.isArray(populateFields) ? populateFields : [populateFields];
    for (const field of fields) {
      query = query.populate(field);
    }
  }

  const results = await query.exec();
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && data.length > 0
    ? String((data[data.length - 1] as any)._id)
    : null;

  return {
    data,
    meta: { limit, hasMore, nextCursor },
  };
}

// ──────────────────────────────────────────────
// Offset-based pagination (for search results)
// ──────────────────────────────────────────────

export interface OffsetPaginationOptions {
  page?: number;
  limit?: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Perform offset-based pagination on a Mongoose query.
 *
 * Best for search results and admin views where page numbers
 * are meaningful to the user.
 */
export async function paginateWithOffset<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  options: OffsetPaginationOptions = {},
  sortField: string = 'createdAt',
  populateFields?: string | string[]
): Promise<OffsetPaginationResult<T>> {
  const page = Math.max(options.page || 1, 1);
  const limit = Math.min(Math.max(options.limit || 20, 1), 100);
  const skip = (page - 1) * limit;

  let query = model
    .find(filter)
    .sort({ [sortField]: -1 } as Record<string, 1 | -1>)
    .skip(skip)
    .limit(limit);

  if (populateFields) {
    const fields = Array.isArray(populateFields) ? populateFields : [populateFields];
    for (const field of fields) {
      query = query.populate(field);
    }
  }

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

