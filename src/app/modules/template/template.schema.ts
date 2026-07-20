import { z } from 'zod';

// Zod 4 — z.string().email() → z.email()
// Zod 4 — z.string().cuid() আর নেই, z.string() দিয়ে validate করো
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Invalid email address'),
});

export const updateUserSchema = createUserSchema.partial();

export const userParamsSchema = z.object({
  id: z.string().min(1, 'Invalid user ID'),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
