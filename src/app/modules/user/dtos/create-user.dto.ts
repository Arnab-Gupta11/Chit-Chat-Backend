import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters'),
  email: z.email('Invalid email address').max(255, 'Email must be at most 255 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 8 characters')
    .refine(
      (value) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(value);
      },
      {
        message:
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      },
    ),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  profilePic: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
