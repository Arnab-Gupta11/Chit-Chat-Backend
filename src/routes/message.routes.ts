import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  sendMessageValidator,
  getMessagesValidator,
  searchMessagesValidator,
  editMessageValidator,
  messageIdParamValidator,
  addReactionValidator,
  forwardMessageValidator,
} from '../validators/message.validator';

// Mounted at /conversations/:conversationId/messages
export const conversationMessageRouter = Router({ mergeParams: true });

conversationMessageRouter.use(authenticate);

conversationMessageRouter.post(
  '/',
  sendMessageValidator,
  validate,
  messageController.sendMessage
);

conversationMessageRouter.get(
  '/',
  getMessagesValidator,
  validate,
  messageController.getMessages
);

conversationMessageRouter.get(
  '/search',
  searchMessagesValidator,
  validate,
  messageController.searchMessages
);

// Mounted at /messages
const messageRouter = Router();

messageRouter.use(authenticate);

messageRouter.patch(
  '/:messageId',
  editMessageValidator,
  validate,
  messageController.editMessage
);

messageRouter.delete(
  '/:messageId',
  messageIdParamValidator,
  validate,
  messageController.deleteMessage
);

messageRouter.post(
  '/:messageId/reactions',
  addReactionValidator,
  validate,
  messageController.addReaction
);

messageRouter.delete(
  '/:messageId/reactions',
  messageIdParamValidator,
  validate,
  messageController.removeReaction
);

messageRouter.post(
  '/:messageId/forward',
  forwardMessageValidator,
  validate,
  messageController.forwardMessage
);

export default messageRouter;
