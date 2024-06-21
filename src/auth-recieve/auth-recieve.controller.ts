import { Body, Controller, Post } from '@nestjs/common';
import { AuthRecieveService } from './auth-recieve.service';

@Controller('auth-recieve')
export class AuthRecieveController {
  constructor(private authRecieveService: AuthRecieveService) {}
  @Post()
  recieveToken(@Body() token) {
    return this.authRecieveService.decodeToken(token.token);
  }
}
