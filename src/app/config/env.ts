import { z } from 'zod';
import 'dotenv/config';

// Zod 4 — z.string().email() → z.email(), z.string().url() → z.url()
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  API_VERSION: z.string().default('v1'),

  // Database (NeonDB)
  // Runtime এ pooled connection
  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),
  // Migration এর জন্য direct connection (optional locally)
  DIRECT_URL: z.url('DIRECT_URL must be a valid URL').optional(),

  // Security
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  // Zod 4 — error.errors → error.issues
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
