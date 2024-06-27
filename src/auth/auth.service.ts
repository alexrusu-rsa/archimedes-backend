import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entity/user.entity';
import { LoginResponse } from 'src/custom/loginResponse';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(currentUser: User) {
    const payload = { username: currentUser.email, sub: currentUser.id };
    // console.log(currentUser);
    return new LoginResponse(this.jwtService.sign(payload), currentUser);
  }
}
