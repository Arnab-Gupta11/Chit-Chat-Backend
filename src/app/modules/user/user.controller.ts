import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { userService } from './user.service';
import { sendCreated } from '../../utils/response';

export const userController = {
  createUser: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.createUser(req.body);
    sendCreated(res, user, 'User created successfully.');
  }),
};
