import { body, param } from 'express-validator';

/** Validation for notification ID param */
export const notificationIdParamValidator = [
  param('notificationId')
    .isMongoId().withMessage('Invalid notification ID format'),
];

/** Validation for updating notification preferences */
export const updatePreferencesValidator = [
  body('messages')
    .optional()
    .isBoolean().withMessage('Messages preference must be a boolean'),

  body('mentions')
    .optional()
    .isBoolean().withMessage('Mentions preference must be a boolean'),

  body('groupUpdates')
    .optional()
    .isBoolean().withMessage('Group updates preference must be a boolean'),
];

