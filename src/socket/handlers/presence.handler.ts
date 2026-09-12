import type {Server as SocketServer} from 'socket.io'
import { AuthenticatedSocket } from '../middlewares/auth.middleware'
export const handlePresence = async(io:SocketServer, socket:AuthenticatedSocket) =>{
    const userId = socket.user?._id.toString();
    if(!userId) return;

    //For handling 
}
