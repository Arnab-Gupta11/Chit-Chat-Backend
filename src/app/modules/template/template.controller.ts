import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler';
import { sendCreated, sendSuccess } from '../../utils/response';
import { userQuerySchema } from './template.schema';
import { userService } from './template.service';

const getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, limit, search } = userQuerySchema.parse(req.query);
  const { users, meta } = await userService.getAll(page, limit, search);
  sendSuccess(res, users, 'Users fetched', 200, meta);
});

const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getById(req.params['id'] as string);
  sendSuccess(res, user);
});

const create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.create(req.body);
  sendCreated(res, user, 'User created');
});

const update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.update(req.params['id'] as string, req.body);
  sendSuccess(res, user, 'User updated');
});

const remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await userService.delete(req.params['id'] as string);
  sendSuccess(res, null, 'User deleted');
});

export const userController = { getAll, getById, create, update, remove };
