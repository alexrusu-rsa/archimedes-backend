import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const token = context
      .switchToHttp()
      .getRequest()
      .headers['authorization'].split(' ')[1];

    let decodedToken;
    try {
      decodedToken = this.jwtService.decode(token);
    } catch (err) {
      return false;
    }
    const currentUserRole = await this.userService.checkRoleOfUser(
      decodedToken.sub,
    );

    return currentUserRole === requiredRoles[0];
  }
}
