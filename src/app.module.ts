import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { RouterModule } from '@nestjs/core';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ActivityModule,
    UserModule,
    RouterModule.register([
      {
        path: 'api/activity',
        module: ActivityModule,
      },
      {
        path: 'user',
        module: UserModule,
      },
    ]),
    MailModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
