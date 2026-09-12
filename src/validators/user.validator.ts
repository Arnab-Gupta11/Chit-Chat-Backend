import { body, param, query } from 'express-validator';
import { VALIDATION } from '../utils/constants';

/** Validation rules for PATCH /users/me */
export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN, max: VALIDATION.NAME_MAX })
    .withMessage(`Name must be ${VALIDATION.NAME_MIN}-${VALIDATION.NAME_MAX} characters`),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.BIO_MAX })
    .withMessage(`Bio cannot exceed ${VALIDATION.BIO_MAX} characters`),
];

/** Validation rules for PATCH /users/me/password */
export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: VALIDATION.PASSWORD_MIN, max: VALIDATION.PASSWORD_MAX })
    .withMessage(`Password must be ${VALIDATION.PASSWORD_MIN}-${VALIDATION.PASSWORD_MAX} characters`)
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/).withMessage('Password must contain at least one digit')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

/** Validation rules for GET /users/search */
export const searchUsersValidator = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: VALIDATION.SEARCH_MIN, max: VALIDATION.SEARCH_MAX })
    .withMessage(`Search query must be ${VALIDATION.SEARCH_MIN}-${VALIDATION.SEARCH_MAX} characters`),
];

/** Validation for user ID param (block/unblock, get profile) */
export const userIdParamValidator = [
  param('userId')
    .isMongoId().withMessage('Invalid user ID format'),
];

