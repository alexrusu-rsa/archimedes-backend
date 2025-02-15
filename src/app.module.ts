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
import { RateModule } from './rate/rate.module';
import { AuthRecieveModule } from './auth-recieve/auth-recieve.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ActivityModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: 'src/i18n/',
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    UserModule,
    InvoiceModule,
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
      { path: 'invoice', module: InvoiceModule },
    ]),
    AuthRecieveModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    JwtService,
    DateFormatService,
  ],
})
export class AppModule {}
