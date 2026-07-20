import { ConflictError, NotFoundError } from '../../utils/errors';
import { userRepository } from './template.repository';

import type { CreateUserDto, UpdateUserDto } from './template.schema';

export const userService = {
  getAll: async (page: number, limit: number, search?: string) => {
    const { users, total } = await userRepository.findAll(page, limit, search);
    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getById: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError(`User with id ${id} not found`);
    return user;
  },

  create: async (data: CreateUserDto) => {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new ConflictError(`User with email ${data.email} already exists`);
    // return userRepository.create(data);
  },

  update: async (id: string, data: UpdateUserDto) => {
    await userService.getById(id);

    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Email ${data.email} is already taken`);
      }
    }

    return userRepository.update(id, data);
  },

  delete: async (id: string) => {
    await userService.getById(id);
    return userRepository.delete(id);
  },
};
