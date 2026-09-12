import type { Server as SocketServer } from "socket.io";
import { logger } from "../../config/logger";
import { User } from "../../models/user.model";
import { AuthenticatedSocket } from "../middlewares/auth.middleware";
export const handlePresence = async (
  io: SocketServer,
  socket: AuthenticatedSocket,
) => {
  const userId = socket.user?._id.toString();
  if (!userId) return;

  //1.For handling Multi-tab open join user in a personal room for each tab
  socket.join(userId);

  try {
    //2. Update online status in database
    await User.findByIdAndUpdate(userId, { isOnline: true });

    //3. Notify other users when a user in onlien
    // socket.broadcast.emit -> event will send to other user not you.
    socket.broadcast.emit("user_online", { userId });
    logger.info(`🟢 User Online: ${socket.user?.name}`);
  } catch (error) {
    logger.error("Error updating online status:", error);
  }

  //4. Handling Disconnect
  socket.on("disconnect", async () => {
    // Check ig this user open any other tab.
    const matchingSockets = await io.in(userId).fetchSockets();
    const isDisconnectedFully = matchingSockets.length === 0;

    if (isDisconnectedFully) {
      try {
        const lastSeen = new Date();
        //Update offline and lastSeen in database
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
        //Notify other that the user is offline
        socket.broadcast.emit("user_offline", { userId, lastSeen });
        logger.info(`🔴 User Offline: ${socket.user?.name}`);
      } catch (error) {
        logger.error("Error updating offline status:", error);
      }
    }
  });
};
