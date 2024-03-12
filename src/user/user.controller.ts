import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { PasswordChangeData } from 'src/custom/password-change-data';
import { User } from 'src/entity/user.entity';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
@ApiTags('User')
@Controller()
export class UserController {
  constructor(private userService: UserService) {}
  @ApiOperation({
    summary: 'Get the number of users',
    description: 'Return the number of existing registered users.',
  })
  @Get('/number')
  getUsersNumber(): Promise<number> {
    return this.userService.getUsersNumber();
  }

  @Post('/first')
  @ApiOperation({
    summary: 'Add first user as admin',
    description: 'Add the first user and grant admin rights',
  })
  addNewAdmin(@Body() user: User): Promise<User> {
    return this.userService.addNewAdmin(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Get all existing users',
    description: 'Fetch a list with all existing users.',
  })
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get specific user',
    description: 'Fetch the user with unique ID given as param',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the user we want to get.',
  })
  getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUser(id);
  }

  @Put('/password')
  @ApiOperation({
    summary: 'Reset user password',
    description:
      'Resets the password of the user specified in the request body.',
  })
  @ApiBody({
    type: User,
    description: 'The user we want to reset the password for.',
  })
  resetUserPassword(@Body() user: User) {
    return this.userService.resetUserPassword(user.email);
  }

  @Put('/change')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change password of a specific user',
    description:
      'Change password of a certain user (unique ID given in request body) with a new password also given in request body',
  })
  @ApiBody({
    description: 'Object containing a new password and a unique user ID.',
  })
  changeUserPassword(@Body() passwordChangeData: PasswordChangeData) {
    return this.userService.changeUserPassword(
      passwordChangeData.newPassword,
      passwordChangeData.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Add a new user',
    description:
      'Add a new user with the details specified in the request body',
  })
  @ApiBody({
    type: User,
    description: 'User that we want to add in the database.',
  })
  addUser(@Body() user: User) {
    return this.userService.addUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Delete the user with the specified unique ID given as parameter.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique ID of the user we want to delete.',
  })
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUserById(userId);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Update user data',
    description:
      'Updates the user data of the user identified with the unique ID given as parameter with the data given as reqeust body.',
  })
  @ApiBody({
    type: User,
    description: 'The updated user data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the user we want to update.',
  })
  updateUser(@Body() user: User, @Param('id') id: string): Promise<User> {
    return this.userService.updateUserById(id, user);
  }
}
