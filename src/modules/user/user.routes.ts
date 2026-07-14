import { Router } from 'express';
import { userController } from './user.controller';

import { createUserSchema, updateUserSchema, userParamsSchema } from './user.schema';
import { validate } from '../../middlewares/validate';

const router = Router();

router.get('/', userController.getAll);
router.get('/:id', validate({ params: userParamsSchema }), userController.getById);
router.post('/', validate({ body: createUserSchema }), userController.create);
router.patch(
  '/:id',
  validate({ params: userParamsSchema, body: updateUserSchema }),
  userController.update,
);

router.delete('/:id', validate({ params: userParamsSchema }), userController.remove);

export { router as userRouter };
