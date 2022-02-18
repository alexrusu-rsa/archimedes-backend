import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { DeleteResult } from 'typeorm';
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
    return this.activityService.addActivity(activity);
  }

  @Get(':id')
  getOneActivity(@Param('id') id: string): Promise<Activity> {
    return this.activityService.findOne(Number(id));
  }

  @Put(':id')
  updateActivity(
    @Body() activity: Activity,
    @Param('id') id: string,
  ): Promise<Activity> {
    return this.activityService.updateById(Number(id), activity);
  }

  @Delete(':id')
  deleteActivity(@Param('id') id: string): Promise<DeleteResult> {
    return this.activityService.deleteActivity(Number(id));
  }
}
