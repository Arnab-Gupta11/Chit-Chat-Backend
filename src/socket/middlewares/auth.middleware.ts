import { Socket } from "socket.io";
import { IUserDocument } from "../../types";
import { verifyAccessToken } from "../../utils/token.utils";
import { User } from "../../models/user.model";

export interface AuthenticatedSocket extends Socket {
  user?: IUserDocument;
}

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  try {
    // Retrive the token from auth.token sent by client while token send in header
    //    const token = socket.handshake?.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    //Retrive token from cookie
    const cookieString = socket.handshake.headers.cookie || "";
    const match = cookieString.match(/(?:^|;\s*)accessToken=([^;]*)/);
    const token = match ? match[1] : null;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    // 2. Verify the token
    const decoded = verifyAccessToken(token);

    //3. Find the user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    //4. Save user info in socket obeject
    socket.user = user;

    //If  everything fine connect socket
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid or expired token"));
  }
};
