import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRecieveController } from './auth-recieve.controller';
import { AuthRecieveService } from './auth-recieve.service';

@Module({
  controllers: [AuthRecieveController],
  providers: [AuthRecieveService, JwtService],
})
export class AuthRecieveModule {}
