import { prisma } from '../../lib/prisma';
import type { CreateUserDto } from './dtos/create-user.dto';

export const userRepository = {
  // your database queries here
  createUser: async (data: CreateUserDto) => {
    const result = await prisma.user.create({ data });
    return result;
  },
  findUserByEmail: async (email: string) => {
    const result = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return result;
  },
  findUniqueUser: async (email: string, username: string) => {
    const result = await prisma.user.findUnique({
      where: {
        email: email,
        username: username,
      },
    });
    return result;
  },
};
