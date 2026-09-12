import { body, param, query } from 'express-validator';
import { REACTION_EMOJIS, VALIDATION } from '../utils/constants';

/** Validation for sending a message */
export const sendMessageValidator = [
  param('conversationId')
    .isMongoId().withMessage('Invalid conversation ID format'),

  body('content')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.MESSAGE_MAX })
    .withMessage(`Message cannot exceed ${VALIDATION.MESSAGE_MAX} characters`),

  body('type')
    .optional()
    .isIn(['text', 'attachment'])
    .withMessage('Message type must be "text" or "attachment"'),

  body('replyTo')
    .optional()
    .isMongoId().withMessage('Invalid reply message ID format'),
];

/** Validation for editing a message */
export const editMessageValidator = [
  param('messageId')
    .isMongoId().withMessage('Invalid message ID format'),

  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required for editing')
    .isLength({ max: VALIDATION.MESSAGE_MAX })
    .withMessage(`Message cannot exceed ${VALIDATION.MESSAGE_MAX} characters`),
];

/** Validation for message ID param */
export const messageIdParamValidator = [
  param('messageId')
    .isMongoId().withMessage('Invalid message ID format'),
];

/** Validation for adding a reaction */
export const addReactionValidator = [
  param('messageId')
    .isMongoId().withMessage('Invalid message ID format'),

  body('emoji')
    .notEmpty().withMessage('Emoji is required')
    .isIn([...REACTION_EMOJIS])
    .withMessage(`Emoji must be one of: ${REACTION_EMOJIS.join(', ')}`),
];

/** Validation for forwarding a message */
export const forwardMessageValidator = [
  param('messageId')
    .isMongoId().withMessage('Invalid message ID format'),

  body('conversationId')
    .notEmpty().withMessage('Target conversation is required')
    .isMongoId().withMessage('Invalid conversation ID format'),
];

/** Validation for searching messages */
export const searchMessagesValidator = [
  param('conversationId')
    .isMongoId().withMessage('Invalid conversation ID format'),

  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: VALIDATION.SEARCH_MIN, max: VALIDATION.SEARCH_MAX })
    .withMessage(`Search query must be ${VALIDATION.SEARCH_MIN}-${VALIDATION.SEARCH_MAX} characters`),
];

/** Validation for getting message history */
export const getMessagesValidator = [
  param('conversationId')
    .isMongoId().withMessage('Invalid conversation ID format'),

  query('cursor')
    .optional()
    .isMongoId().withMessage('Invalid cursor format'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

