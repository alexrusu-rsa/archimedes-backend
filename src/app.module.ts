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
import { XlsxService } from './xlsx/xlsx.service';
import { PdfService } from './pdf/pdf.service';
import { DateFormatService } from './date-format/date-format.service';

@Module({
  imports: [
    ActivityModule,
    UserModule,
    CustomerModule,
    ProjectModule,
    AuthModule,
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
    ]),
    MailModule,
  ],
  controllers: [AppController],
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
