import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { Conversation } from "../../models/conversation.model";
import { Message } from "../../models/message.model";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
import { socketError } from "../utils/errorHandler";
import { ReactionEmoji } from "../../utils/constants";
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

  //5. Edit Message
  socket.on(
    "edit_message",
    async (
      data: { messageId: string; conversationId: string; newText: string },
      callback: Function,
    ) => {
      try {
        const message = await Message.findById(data.messageId);
        //1. Check if message is available
        if (!message) {
          throw new Error(data.messageId);
        }
        //2. Check only the message owner edit the message
        if (message.sender.toString() !== userId?.toString()) {
          throw new Error("Unauthorized to edit this message");
        }

        //3. Update Database

        message.content = data.newText;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        //4. Notify everyone in the room.
        io.to(data.conversationId).emit("message_edited", {
          messageId: message._id,
          newText: data.newText,
          editedAt: message.editedAt,
        });

        if (typeof callback === "function") callback({ status: "success" });
        logger.info(`✏️ Message ${data.messageId} edited`);
      } catch (error) {
        socketError(socket, "edit_message", error);
        if (typeof callback === "function") callback({ status: "error" });
      }
    },
  );

  //7. Delete Message (Soft Delete)
  socket.on(
    "delete_message",
    async (data: { messageId: string; conversationId: string }, callback) => {
      try {
        const message = await Message.findById(data.messageId);
        //1. Check if message is available
        if (!message) {
          throw new Error(data.messageId);
        }
        //2. Check only the message owner edit the message
        if (message.sender.toString() !== userId?.toString()) {
          throw new Error("Unauthorized to delete this message");
        }
        //Soft delete
        message.content = "This message was deleted";
        message.isDeleted = true;
        message.deletedAt = new Date();
        await message.save();

        //Notify everyone in a room
        io.to(data.conversationId).emit("message_deleted", {
          messageId: message._id,
          deletedAt: message.deletedAt,
        });
        if (typeof callback === "function") callback({ status: "success" });
        logger.info(`🗑️ Message ${data.messageId} deleted`);
      } catch (error) {
        socketError(socket, "delete_message", error);
        if (typeof callback === "function") callback({ status: "error" });
      }
    },
  );
  // 8. Toggle Reaction (Add / Remove)
  socket.on(
    "toggle_reaction",
    async (
      data: { messageId: string; conversationId: string; emoji: ReactionEmoji },
      callback: Function,
    ) => {
      try {
        const message = await Message.findById(data.messageId);
        if (!message) throw new Error("Message not found");

        // চেক করা ঐ ইউজার আগে থেকে কোনো রিঅ্যাকশন দিয়েছে কি না
        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.user.toString() === userId?.toString(),
        );

        if (existingReactionIndex > -1) {
          // যদি একই ইমোজি আবার দেয়, তবে রিমুভ করে দেওয়া (Toggle Off)
          if (message.reactions[existingReactionIndex].emoji === data.emoji) {
            message.reactions.splice(existingReactionIndex, 1);
          } else {
            // অন্য ইমোজি দিলে আগেরটা পরিবর্তন করে নতুনটা দেওয়া
            message.reactions[existingReactionIndex].emoji = data.emoji;
          }
        } else {
          // একদম নতুন রিঅ্যাকশন হলে অ্যাড করা
          message.reactions.push({
            user: userId as any,
            emoji: data.emoji,
            createdAt: new Date(),
          });
        }

        await message.save();

        // রুমের সবাইকে আপডেট পাঠানো
        io.to(data.conversationId).emit("reaction_updated", {
          messageId: message._id,
          reactions: message.reactions,
        });

        if (typeof callback === "function") callback({ status: "success" });
        logger.info(`👍 Reaction updated on message ${data.messageId}`);
      } catch (error) {
        socketError(socket, "toggle_reaction", error);
        if (typeof callback === "function") callback({ status: "error" });
      }
    },
  );
};
