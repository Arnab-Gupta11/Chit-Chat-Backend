import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { Message } from "../../models/message.model";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
import { socketError } from "../utils/errorHandler";
export const handleSync = (io: SocketServer, socket: AuthenticatedSocket) => {
  //Client looking for missed message
  socket.on(
    "sync_message",
    async (
      data: { conversationId: string; lastMessageTimestamp: string },
      callback: Function,
    ) => {
      try {
        if (!data.conversationId || !data.lastMessageTimestamp) {
          throw new Error(
            "converstionId and lastmessageTimestamp are required",
          );
        }

        // Find all the message after the timestampas
        const missedMessages = await Message.find({
          conversation: data.conversationId,
          createdAt: {
            $gt: new Date(data.lastMessageTimestamp),
          },
        })
          .populate("sender", "name avatar")
          .sort({ createdAt: 1 });

        //Send all the message as acknowledgemnt
        if (typeof callback === "function") {
          callback({
            status: "success",
            missedCount: missedMessages.length,
            messages: missedMessages,
          });
        }
        logger.info(
          `🔄 Synced ${missedMessages.length} missed messages for user ${socket.user?.name}`,
        );
      } catch (error) {
        socketError(socket, "sync_messages", error);
        if (typeof callback === "function") {
          callback({ status: "error", error: "Failed to sync messages" });
        }
      }
    },
  );
};
