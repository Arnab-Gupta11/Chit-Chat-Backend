import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { uploadAvatar } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import {
  updateProfileValidator,
  changePasswordValidator,
  searchUsersValidator,
  userIdParamValidator
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', updateProfileValidator, validate, userController.updateProfile);
router.patch('/me/avatar', uploadAvatar, userController.updateAvatar);
router.patch('/me/password', changePasswordValidator, validate, userController.changePassword);

router.get('/search', searchUsersValidator, validate, userController.searchUsers);
router.get('/blocked', userController.getBlockedUsers);

router.post('/block/:userId', userIdParamValidator, validate, userController.blockUser);
router.delete('/block/:userId', userIdParamValidator, validate, userController.unblockUser);
router.get('/:userId', userIdParamValidator, validate, userController.getUserProfile);

export default router;
