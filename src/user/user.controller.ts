import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { User } from 'src/entity/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(JwtAuthGuard)
  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUser(@Param() id: string): Promise<User> {
    return this.userService.getUser(id);
  }

  @Put('/password')
  resetUserPassword(@Body() user: User) {
    return this.userService.resetUserPassword(user.email);
  }

  @Post()
  addUser(@Body() user: User) {
    return this.userService.addUser(user);
  }

  @Delete(':id')
  deleteUser(@Param() userId: string) {
    return this.userService.deleteUserById(userId);
  }

  @Put(':id')
  updateUser(@Body() user: User, @Param('id') id: string): Promise<User> {
    return this.userService.updateUserById(id, user);
  }
}
