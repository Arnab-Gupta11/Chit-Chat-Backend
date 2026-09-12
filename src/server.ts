import http from 'http';
import { app } from './app';
import { config } from './config';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './config/logger';
import { initializeSocket } from './socket';

// Create HTTP server (Socket.IO will attach to this later)
const server = http.createServer(app);

// ── Socket.IO initialization ─────────────────
initializeSocket(server);
// ────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`📡 API available at http://localhost:${config.port}/api/v1`);
      logger.info(`❤️  Health check at http://localhost:${config.port}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    await disconnectDB();
    logger.info('All connections closed. Exiting.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
