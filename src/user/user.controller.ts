import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { User } from 'src/entity/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get(':id')
  getUser(@Param() id: string): Promise<User> {
    return this.userService.getUser(id);
  }

  @Post('/creds')
  logUserByUsername(@Body() user: User): Promise<RequestWrapper> {
    return this.userService.logUserIn(user.email, user.password);
  }

  @Put('/password')
  resetUserPassword(@Body() user: User) {
    return this.userService.resetUserPassword(user.email);
  }

  @Post()
  addUser(@Body() user: User) {
    return this.userService.addUser(user);
  }
}
