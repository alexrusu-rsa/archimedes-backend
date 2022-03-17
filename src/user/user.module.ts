import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { MailModule } from 'src/mail/mail.module';
import { UserProvider } from 'src/providers/user.provider';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule, MailModule],
  controllers: [UserController],
  providers: [...UserProvider, UserService],
  exports: [UserService],
})
export class UserModule {}
