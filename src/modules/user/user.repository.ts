
import { prisma } from '../../lib/prisma';
import type { CreateUserDto, UpdateUserDto } from './user.schema';

export const userRepository = {
  findAll: async (page: number, limit: number, search?: string) => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  create: async (data: CreateUserDto) => {
    return prisma.user.create({ data });
  },

  update: async (id: string, data: UpdateUserDto) => {
    return prisma.user.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
