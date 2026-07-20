import { validate } from './../../middlewares/validate';
import { Router } from 'express';
import { userController } from './user.controller';
import { createUserSchema } from './dtos/create-user.dto';

const router = Router();

router.route('/register').post(validate({ body: createUserSchema }), userController.createUser);

export const userRoutes = router;
