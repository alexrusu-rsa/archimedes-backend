import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { ActivityProvider } from 'src/providers/activity.provider';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ActivityController],
  providers: [...ActivityProvider, ActivityService],
})
export class ActivityModule {}
