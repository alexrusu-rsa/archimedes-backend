import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { UserProvider } from 'src/providers/user.provider';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [...UserProvider, UserService],
})
export class UserModule {}
