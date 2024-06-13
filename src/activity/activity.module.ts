import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { DateFormatService } from 'src/date-format/date-format.service';
import { ActivityProvider } from 'src/providers/activity.provider';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ProjectService } from 'src/project/project.service';
import { ProjectProvider } from 'src/providers/project.provider';
import { RateProvider } from 'src/providers/rate.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ActivityController],
  providers: [
    ...ActivityProvider,
    ...ProjectProvider,
    ...RateProvider,
    ActivityService,
    DateFormatService,
    ProjectService,
  ],
})
export class ActivityModule {}
