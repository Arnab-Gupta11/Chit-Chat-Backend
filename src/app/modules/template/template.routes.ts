import { Router } from 'express';
import { userController } from './template.controller';

import { validate } from '../../middlewares/validate';
import { createUserSchema, updateUserSchema, userParamsSchema } from './template.schema';

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
