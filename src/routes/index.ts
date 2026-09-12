import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import conversationRoutes from './conversation.routes';
import messageRoutes, { conversationMessageRouter } from './message.routes';
import notificationRoutes from './notification.routes';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

// Message routes nested under conversations
router.use('/conversations/:conversationId/messages', authenticate, conversationMessageRouter);

export default router;
