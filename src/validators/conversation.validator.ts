import { body, param } from 'express-validator';
import { CONVERSATION_TYPES, GROUP_LIMITS, ROLES } from '../utils/constants';

/** Validation for creating a conversation */
export const createConversationValidator = [
  body('type')
    .notEmpty().withMessage('Conversation type is required')
    .isIn(Object.values(CONVERSATION_TYPES))
    .withMessage(`Type must be one of: ${Object.values(CONVERSATION_TYPES).join(', ')}`),

  body('name')
    .if(body('type').equals(CONVERSATION_TYPES.GROUP))
    .trim()
    .notEmpty().withMessage('Group name is required for group conversations')
    .isLength({ max: GROUP_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`Group name cannot exceed ${GROUP_LIMITS.MAX_NAME_LENGTH} characters`),

  body('participants')
    .isArray({ min: 1 }).withMessage('At least one other participant is required'),

  body('participants.*')
    .isMongoId().withMessage('Invalid participant ID format'),
];

/** Validation for updating group info */
export const updateConversationValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: GROUP_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`Group name must be 1-${GROUP_LIMITS.MAX_NAME_LENGTH} characters`),
];

/** Validation for adding members to a group */
export const addMembersValidator = [
  body('members')
    .isArray({ min: 1 }).withMessage('At least one member is required'),

  body('members.*')
    .isMongoId().withMessage('Invalid member ID format'),
];

/** Validation for changing a member's role */
export const changeMemberRoleValidator = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

/** Validation for conversation ID param */
export const conversationIdParamValidator = [
  param('conversationId')
    .isMongoId().withMessage('Invalid conversation ID format'),
];

/** Validation for member userId param in conversation routes */
export const memberUserIdParamValidator = [
  param('conversationId')
    .isMongoId().withMessage('Invalid conversation ID format'),
  param('userId')
    .isMongoId().withMessage('Invalid user ID format'),
];

