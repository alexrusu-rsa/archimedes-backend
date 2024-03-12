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
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { PasswordChangeData } from 'src/custom/password-change-data';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { RequestWrapperWithUserRole } from 'src/custom/requestWrapperWithUserRole';
import { User } from 'src/entity/user.entity';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('User')
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
  @Get(':id')
  getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUser(id);
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
}
