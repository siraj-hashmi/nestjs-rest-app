import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import axios from 'axios';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: any) {
    return await this.userService.createUser(createUserDto);
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    try {
      const response = await axios.get(`https://reqres.in/api/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    const user = await axios.get(`https://reqres.in/api/users/${userId}`);
    if (!user.data.data.avatar) {
      throw new NotFoundException('Avatar not found');
    }

    return await this.userService.getAvatar(userId, user.data.data.avatar);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    await this.userService.deleteAvatar(userId);
    return { message: 'Avatar deleted successfully' };
  }
}
