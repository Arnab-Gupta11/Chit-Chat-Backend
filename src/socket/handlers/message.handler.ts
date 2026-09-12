import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
export const handleMessage = (
  io: SocketServer,
  socket: AuthenticatedSocket,
) => {
  const userId = socket.user?._id;

  //1. Join Conversation Room
  socket.on("join_conversation", (data:{conversationId: string}) => {
    const {conversationId}= data;
    socket.join(conversationId);
    logger.info(
      `👥 User ${socket.user?.name} joined conversation: ${conversationId}`,
    );
  });

  //2. Leave Conversation Room
  socket.on("leave_conversation", (data:{conversationId: string}) => {
    const {conversationId}= data;
    socket.leave(conversationId);
    logger.info(
      `👋 User ${socket.user?.name} left conversation: ${conversationId}`,
    );
  });

  //3. Send Message
  socket.on(
    "send_message",
    async (data: { conversationId: string; text: string }) => {
      const { conversationId, text } = data;
      try {
        const newMessage = {
          _id: Math.random().toString(36).substr(2, 9),
          conversation: conversationId,
          sender: userId,
          content: text,
          createdAt: new Date(),
        };
        // Send message only those user who joind this conversationId Room
        io.to(conversationId).emit("new_message", newMessage);
        logger.info(
          `✉️ Message sent to room ${conversationId} by ${socket.user?.name}`,
        );
      } catch (error) {
        logger.error("Error sending message:", error);
      }
    },
  );
};
