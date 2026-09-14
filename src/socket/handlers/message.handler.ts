import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { Conversation } from "../../models/conversation.model";
import { Message } from "../../models/message.model";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
export const handleMessage = (
  io: SocketServer,
  socket: AuthenticatedSocket,
) => {
  const userId = socket.user?._id;

  //1. Join Conversation Room
  socket.on("join_conversation", (data: { conversationId: string }) => {
    const { conversationId } = data;
    socket.join(conversationId);
    logger.info(
      `👥 User ${socket.user?.name} joined conversation: ${conversationId}`,
    );
  });

  //2. Leave Conversation Room
  socket.on("leave_conversation", (data: { conversationId: string }) => {
    const { conversationId } = data;
    socket.leave(conversationId);
    logger.info(
      `👋 User ${socket.user?.name} left conversation: ${conversationId}`,
    );
  });

  //3. Send Message
  socket.on(
    "send_message",
    async (
      data: { conversationId: string; text: string },
      callback: Function,
    ) => {
      const { conversationId, text } = data;
      try {
        //1. Save message in database
        const newMessage = await Message.create({
          conversation: conversationId,
          sender: userId,
          content: text,
          type: "text",
        });
        //2. Update converstation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });
        //Populate sender informatin for frontend
        await newMessage.populate("sender", "name avaar");
        // Send message only those user who joind this conversationId Room
        io.to(conversationId).emit("new_message", newMessage);
        logger.info(
          `✉️ Message sent to room ${conversationId} by ${socket.user?.name}`,
        );

        //Confirm sender that message is received (single tick)
        if (typeof callback === "function") {
          callback({
            status: "success",
            messageId: newMessage._id,
            timeStamp: newMessage.createdAt,
          });
        }
      } catch (error) {
        logger.error("Error sending message:", error);
        //Notify sender that error happend
        if (typeof callback === "function") {
          callback({
            status: "error",
            error: "Failed to send message",
          });
        }
      }
    },
  );

  //4. Message Delivered (Double Tick)
  socket.on(
    "message_delivered",
    async (data: { messageId: string; conversationId: string }) => {
      try {
        // update deliveredTo status in database
        await Message.findByIdAndUpdate(data.messageId, {
          $push: {
            deliveredTo: {
              user: userId,
              deliveredAt: new Date(),
            },
          },
        });

        // সেন্ডারকে জানিয়ে দেওয়া যে তার মেসেজ ডেলিভারি হয়েছে
        socket.to(data.conversationId).emit("delivery_update", {
          messageId: data.messageId,
          deliveredAt: new Date(),
        });

        logger.debug(`📩 Message ${data.messageId} delivered`);
      } catch (error) {
        logger.error("Error updating delivery status:", error);
      }
    },
  );

  // 5. Message Read (Seen / Blue Tick)

  socket.on(
    "message_read",
    async (data: { messageId: string; conversationId: string }) => {
      try {
        //1. Update readBy field in databasae
        await Message.findByIdAndUpdate(data.messageId, {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date(),
            },
          },
        });
        //2. Notify sender that the message is seen.
        socket.to(data.conversationId).emit("read_update", {
          messageId: data.messageId,
          readAt: new Date(),
        });
        logger.debug(
          `👁️ Message ${data.messageId} read by ${socket.user?.name}`,
        );
      } catch (error) {
        logger.error("Error updating read status:", error);
      }
    },
  );
};
