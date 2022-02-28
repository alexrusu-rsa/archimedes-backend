import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { ActivityService } from './activity.service';

@Controller()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  getAllActivities(): Promise<Activity[]> {
    return this.activityService.getActivities();
  }

  @Post()
  addNewActivity(@Body() activity: Activity) {
    console.log('test');
    return this.activityService.addActivity(activity);
  }

  @Get('/date')
  getActivitiesTest(@Query('dateToFind') date): any {
    return this.activityService.getActivitiesByDate(date);
  }

  @Get(':id')
  getOneActivity(@Param('id') id: string): Promise<Activity> {
    console.log(id);
    return this.activityService.findOne(id);
  }

  @Put(':id')
  updateActivity(
    @Body() activity: Activity,
    @Param('id') id: string,
  ): Promise<Activity> {
    return this.activityService.updateById(id, activity);
  }

  @Delete(':id')
  deleteActivity(@Param('id') id: string): Promise<any> {
    console.log('STARTED DELETE');
    return this.activityService.deleteActivity(id);
  }
}
