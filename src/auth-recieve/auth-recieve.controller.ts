import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { AuthRecieveService } from './auth-recieve.service';

@Controller('auth-recieve')
export class AuthRecieveController {
  constructor(private authRecieveService: AuthRecieveService) {}
  @Post()
  recieveToken(@Body() token) {
    return this.authRecieveService.decodeToken(token.token);
  }
}
