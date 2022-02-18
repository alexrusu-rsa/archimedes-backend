import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ActivityModule,
    RouterModule.register([
      {
        path: 'api/activity',
        module: ActivityModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
