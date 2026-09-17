import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { config } from "../config";
import { logger } from "../config/logger";
import { handleMessage } from "./handlers/message.handler";
import { handlePresence } from "./handlers/presence.handler";
import { handleSync } from "./handlers/sync.handler";
import { handleTyping } from "./handlers/typing.handler";
import {
  AuthenticatedSocket,
  socketAuthMiddleware,
} from "./middlewares/auth.middleware";

let io: SocketServer | null = null;

/**
 * Initialize Socket.IO server.
 *
 * This is a skeleton — actual event handlers will be implemented
 * step by step during the Socket.IO learning phase.
 */
export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  logger.info("🔌 Socket.IO server initialized");

  // ── Authentication middleware will be added here ──
  io.use(socketAuthMiddleware);

  // ── Connection handler will be added here ─────────
  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(
      `⚡ New client connected: ${socket.id}, User: ${socket.user?.name}`,
    );

    handlePresence(io!, socket);
    handleMessage(io!, socket);
    handleTyping(io!, socket);
    handleSync(io!, socket);

    //Disconnect event
    socket.on("disconnect", (reason) => {
      logger.info(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });

  // ==========================================
  // 🔔 NOTIFICATION NAMESPACE (/notification)
  // ==========================================

  const notificationNamespace = io.of("/notification");
  //use auth middleware in notification namespace.
  notificationNamespace.use(socketAuthMiddleware);
  //Listen connection
  notificationNamespace.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(
      `🔔 New client connected to Notification Namespace: ${socket.id}, User: ${socket.user?.name}`,
    );

    //Notification Events

    socket.on("disconnect", (reason) => {
      logger.info(
        `🔕 Client disconnected from Notification Namespace: ${socket.id}, Reason: ${reason}`,
      );
    });
  });

  return io;
};

/**
 * Get the Socket.IO server instance.
 * Useful for emitting events from services/controllers.
 */
export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initializeSocket() first.",
    );
  }
  return io;
};
