import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { RouterModule } from '@nestjs/core';
import { DayModule } from './day/day.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    ActivityModule,
    RouterModule.register([
      {
        path: 'api/activity',
        module: ActivityModule,
      },
    ]),
    DayModule,
    EmployeeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
