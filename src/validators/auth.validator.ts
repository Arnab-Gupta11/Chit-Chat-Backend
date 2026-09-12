import { body } from 'express-validator';
import { VALIDATION } from '../utils/constants';

/** Validation rules for POST /auth/register */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: VALIDATION.NAME_MIN, max: VALIDATION.NAME_MAX })
    .withMessage(`Name must be ${VALIDATION.NAME_MIN}-${VALIDATION.NAME_MAX} characters`),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: VALIDATION.PASSWORD_MIN, max: VALIDATION.PASSWORD_MAX })
    .withMessage(`Password must be ${VALIDATION.PASSWORD_MIN}-${VALIDATION.PASSWORD_MAX} characters`)
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/).withMessage('Password must contain at least one digit'),
];

/** Validation rules for POST /auth/login */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

