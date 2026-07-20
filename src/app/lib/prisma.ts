/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { env } from '../config/env';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  console.log('Database Url===========>', env.DATABASE_URL);
  // const pool = new Pool({ connectionString: env.DATABASE_URL });
  // const adapter = new PrismaPg(pool);
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

  // console.log("=======Pool Option========>", pool.options);

  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'DB Query');
  });
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
