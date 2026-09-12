import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import * as conversationController from '../controllers/conversation.controller';
import {
  createConversationValidator,
  conversationIdParamValidator,
  updateConversationValidator,
  addMembersValidator,
  memberUserIdParamValidator,
  changeMemberRoleValidator
} from '../validators/conversation.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  createConversationValidator,
  validate,
  conversationController.createConversation
);

router.get(
  '/',
  conversationController.getConversations
);

router.get(
  '/:conversationId',
  conversationIdParamValidator,
  validate,
  conversationController.getConversation
);

router.patch(
  '/:conversationId',
  conversationIdParamValidator,
  updateConversationValidator,
  validate,
  conversationController.updateConversation
);

router.delete(
  '/:conversationId',
  conversationIdParamValidator,
  validate,
  conversationController.deleteConversation
);

router.post(
  '/:conversationId/members',
  conversationIdParamValidator,
  addMembersValidator,
  validate,
  conversationController.addMembers
);

router.delete(
  '/:conversationId/members/:userId',
  memberUserIdParamValidator, // This validator likely includes both conversationId and userId
  validate,
  conversationController.removeMember
);

router.patch(
  '/:conversationId/members/:userId/role',
  memberUserIdParamValidator,
  changeMemberRoleValidator,
  validate,
  conversationController.changeMemberRole
);

router.post(
  '/:conversationId/leave',
  conversationIdParamValidator,
  validate,
  conversationController.leaveConversation
);

router.post(
  '/:conversationId/read',
  conversationIdParamValidator,
  validate,
  conversationController.markAsRead
);

router.get(
  '/:conversationId/unread',
  conversationIdParamValidator,
  validate,
  conversationController.getUnreadCount
);

export default router;
