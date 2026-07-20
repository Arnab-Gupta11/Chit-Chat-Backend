import { ConflictError } from '../../utils/errors';
import type { CreateUserDto } from './dtos/create-user.dto';
import { userRepository } from './user.repository';

export const userService = {
  // your business logic here
  createUser: async (data: CreateUserDto) => {
    const existingUser = await userRepository.findUniqueUser(data.email, data.username);
    if (existingUser?.email === data.email) {
      throw new ConflictError(`User with this email: ${data.email} already exist!`);
    }
    if (existingUser?.username === data.username) {
      throw new ConflictError(`User with this username: ${data.username} already exist!`);
    }
    const result = await userRepository.createUser(data);
    return result;
  },
};
