
import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendError, sendSuccess } from '../../utils/response';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

// Response time tracking
const responseTimes: number[] = [];

export function trackResponseTime(ms: number): void {
  responseTimes.push(ms);
  if (responseTimes.length > 100) responseTimes.shift(); // keep last 100
}

function getAvgResponseTime(): string {
  if (responseTimes.length === 0) return 'N/A';
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  return `${Math.round(avg)}ms`;
}

function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

const check = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  sendSuccess(res, {
    status: 'ok',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
  });
});

const dbCheck = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, { status: 'ok', database: 'connected' });
  } catch (err) {
    logger.error({ err }, 'DB health check failed');
    sendError(res, 'Database connection failed', 503, (err as Error).message);
  }
});

const runtimeStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const mem = process.memoryUsage();
  sendSuccess(res, {
    memUsed: formatBytes(mem.heapUsed),
    memTotal: formatBytes(mem.heapTotal),
    rss: formatBytes(mem.rss),
    avgResponseTime: getAvgResponseTime(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
  });
});

export const healthController = { check, dbCheck, runtimeStats };
