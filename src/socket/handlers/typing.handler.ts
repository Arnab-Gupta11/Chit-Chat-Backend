import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
import { socketError } from "../utils/errorHandler";

export const handleTyping = (io: SocketServer, socket: AuthenticatedSocket) => {
  const userId = socket.user?._id.toString();
  const userName = socket.user?.name;

  //1.Typing Start
  socket.on("typing_start", (data: { conversationId: string }) => {
    try {
      if (!data.conversationId) throw new Error("Conversation ID is required");
      socket.to(data.conversationId).emit("typing", {
        conversationId: data.conversationId,
        userId,
        userName,
        isTyping: true,
      });
      logger.info(`✍️  ${userName} is typing in ${data.conversationId}`);
    } catch (error) {
      socketError(socket, "typing_start", error);
    }
  });
  //Typing Stop
  socket.on("typing_stop", (data: { conversationId: string }) => {
    socket.to(data.conversationId).emit("typing", {
      conversationId: data.conversationId,
      userId,
      userName,
      isTyping: false,
    });
    logger.info(`🛑 ${userName} stopped typing in ${data.conversationId}`);
  });
};
