import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@Injectable()
export class AuthRecieveService {
  constructor(private jwtService: JwtService) {}

  decodeToken(token: string) {
    const tokenContent = this.jwtService.decode(token);
    const user = Object.values(tokenContent)[0];
    const id = tokenContent.sub;
    const payload = { username: user, sub: id };
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '8600s',
    });
  }
}
