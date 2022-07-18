import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/roles.guard';
import { CustomerModule } from './customer/customer.module';
import { ProjectModule } from './project/project.module';
import { DateFormatService } from './date-format/date-format.service';
import { RateController } from './rate/rate.controller';
import { RateService } from './rate/rate.service';
import { RateModule } from './rate/rate.module';

@Module({
  imports: [
    ActivityModule,
    UserModule,
    CustomerModule,
    ProjectModule,
    AuthModule,
    MailModule,
    RateModule,
    RouterModule.register([
      {
        path: 'activity',
        module: ActivityModule,
      },
      {
        path: 'user',
        module: UserModule,
      },
      {
        path: 'customer',
        module: CustomerModule,
      },
      {
        path: 'project',
        module: ProjectModule,
      },
      {
        path: 'rate',
        module: RateModule,
      },
    ]),
  ],
  controllers: [AppController, RateController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    DateFormatService,
  ],
})
export class AppModule {}
