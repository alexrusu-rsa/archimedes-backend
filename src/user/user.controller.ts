import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { PasswordChangeData } from 'src/custom/password-change-data';
import { User } from 'src/entity/user.entity';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/number')
  getUsersNumber(): Promise<number> {
    return this.userService.getUsersNumber();
  }

  @Post('/first')
  addNewAdmin(@Body() user: User): Promise<User> {
    return this.userService.addNewAdmin(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserMe(@Req() request: Request): Promise<User> {
    const user = request.user as { userId: string; username: string };
    return this.userService.getUser(user.userId);
  }

  @Put('/password')
  resetUserPassword(@Body() user: User) {
    return this.userService.resetUserPassword(user.email);
  }

  @Put('/change')
  @UseGuards(JwtAuthGuard)
  changeUserPassword(@Body() passwordChangeData: PasswordChangeData) {
    return this.userService.changeUserPassword(
      passwordChangeData.newPassword,
      passwordChangeData.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  addUser(@Body() user: User) {
    return this.userService.addUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUserById(userId);
  }

  @Put(':id')
  @Roles(Role.Admin)
  updateUser(@Body() user: User, @Param('id') id: string): Promise<User> {
    return this.userService.updateUserById(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/time/:id')
  getUserTimePerDay(@Param('id') userId: string): Promise<number> {
    return this.userService.getUserTimePerDay(userId);
  }
}
