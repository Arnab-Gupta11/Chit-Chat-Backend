import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { param, body } from 'express-validator';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

const notificationIdParamValidator = [
  param('notificationId').isMongoId().withMessage('Invalid notification ID')
];

const updatePreferencesValidator = [
  body('messages').optional().isBoolean().withMessage('Messages preference must be a boolean'),
  body('mentions').optional().isBoolean().withMessage('Mentions preference must be a boolean'),
  body('groupUpdates').optional().isBoolean().withMessage('Group updates preference must be a boolean')
];

// All routes require authentication
router.use(authenticate);

// Specific routes first to avoid conflicts with parameterized routes
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.get('/preferences', notificationController.getPreferences);
router.patch(
  '/preferences',
  updatePreferencesValidator,
  validate,
  notificationController.updatePreferences
);

// General and parameterized routes
router.get('/', notificationController.getNotifications);
router.patch(
  '/:notificationId/read',
  notificationIdParamValidator,
  validate,
  notificationController.markAsRead
);
router.delete(
  '/:notificationId',
  notificationIdParamValidator,
  validate,
  notificationController.deleteNotification
);

export default router;
