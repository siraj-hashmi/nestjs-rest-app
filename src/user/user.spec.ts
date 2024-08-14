import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import axios from 'axios';
import { NotFoundException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getAvatar: jest.fn(),
            deleteAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user and return the result', async () => {
      const createUserDto = {
        name: 'Siraj Hashmi',
        email: 'msiraj1000@gmail.com',
      };
      const createdUser = { id: 1, ...createUserDto };

      (userService.createUser as jest.Mock).mockResolvedValueOnce(createdUser);

      const result = await userController.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getUser', () => {
    it('should return user data if user exists', async () => {
      const userId = '1';
      const userData = {
        id: 1,
        email: 'user@test.com',
        first_name: 'Siraj',
        last_name: 'Hashmi',
        avatar: 'avatar.png',
      };

      mockedAxios.get.mockResolvedValueOnce({ data: { data: userData } });

      const result = await userController.getUser(userId);

      expect(result).toEqual(userData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '999';

      mockedAxios.get.mockRejectedValueOnce(new Error('User not found'));

      await expect(userController.getUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });
  });

  describe('getAvatar', () => {
    it('should return avatar URL if it exists', async () => {
      const userId = '1';
      const avatarUrl = 'avatar.png';
      const userData = { data: { id: 1, avatar: avatarUrl } };

      mockedAxios.get.mockResolvedValueOnce({ data: userData });
      (userService.getAvatar as jest.Mock).mockResolvedValueOnce(avatarUrl);

      const result = await userController.getAvatar(userId);

      expect(result).toEqual(avatarUrl);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
      expect(userService.getAvatar).toHaveBeenCalledWith(userId, avatarUrl);
    });

    it('should throw NotFoundException if avatar does not exist', async () => {
      const userId = '1';
      const userData = { data: { id: 1, avatar: null } };

      mockedAxios.get.mockResolvedValueOnce({ data: userData });

      await expect(userController.getAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and return success message', async () => {
      const userId = '1';

      const result = await userController.deleteAvatar(userId);

      expect(result).toEqual({ message: 'Avatar deleted successfully' });
      expect(userService.deleteAvatar).toHaveBeenCalledWith(userId);
    });
  });
});
