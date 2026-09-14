import { Socket } from "socket.io";
import { logger } from "../../config/logger";

export const socketError = (socket: Socket, action: string, error: any) => {
  logger.error(`❌ Socket Error [${action}]:`, error);

  //Send error directly to the client
  socket.emit("server_error", {
    action,
    message:error.message || "An unexpected error occured"
  })
};
