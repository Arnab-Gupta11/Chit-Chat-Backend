import { SocketEvent } from "../../constants/socketEvents";
import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
import { socketError } from "../utils/errorHandler";

export const handleTyping = (io: SocketServer, socket: AuthenticatedSocket) => {
  const userId = socket.user?._id.toString();
  const userName = socket.user?.name;

  //1.Typing Start
  socket.on(SocketEvent.TYPING_START, (data: { conversationId: string }) => {
    try {
      if (!data.conversationId) throw new Error("Conversation ID is required");
      socket.to(data.conversationId).emit(SocketEvent.TYPING, {
        conversationId: data.conversationId,
        userId,
        userName,
        isTyping: true,
      });
      logger.info(`✍️  ${userName} is typing in ${data.conversationId}`);
    } catch (error) {
      socketError(socket, SocketEvent.TYPING_START, error);
    }
  });
  //Typing Stop
  socket.on(SocketEvent.TYPING_STOP, (data: { conversationId: string }) => {
    socket.to(data.conversationId).emit(SocketEvent.TYPING, {
      conversationId: data.conversationId,
      userId,
      userName,
      isTyping: false,
    });
    logger.info(`🛑 ${userName} stopped typing in ${data.conversationId}`);
  });
};
