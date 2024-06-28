import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { ActivityDuplicateRange } from 'src/custom/activity-duplicate-range';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { Activity } from 'src/entity/activity.entity';
import { ActivityService } from './activity.service';
import { Request } from 'express';
import { MonthYear } from 'src/custom/month-year';
import { DeleteResult } from 'typeorm';
@Controller()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllActivities(): Promise<Activity[]> {
    return this.activityService.getActivities();
  }

  @Post('/duplicate')
  duplicateActivityInDateRange(
    @Body() activityDuplicateRange: ActivityDuplicateRange,
  ) {
    return this.activityService.addActivitiesInRange(activityDuplicateRange);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/date')
  getActivitiesOfEmployeeOnCertainDate(
    @Body() request: RequestWrapper,
  ): Promise<Activity[]> {
    return this.activityService.getActivitiesByDateEmployeeId(
      request.data,
      request.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/types')
  getAvailableActivityTypes() {
    return this.activityService.getActivityTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':year/:month')
  @Roles(Role.Admin)
  getActivitiesOfMonthYear(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.activityService.getActivitiesMonthYear(year, month);
  }

  @Post('/employee')
  @Roles(Role.Admin)
  getActivitiesOfEmployee(
    @Body() request: RequestWrapper,
  ): Promise<Activity[]> {
    return this.activityService.getActivitiesByEmployeeId(request.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  addNewActivity(@Body() activity: Activity) {
    return this.activityService.addActivity(activity);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/date')
  getActivitiesTest(@Query('dateToFind') date): any {
    return this.activityService.getActivitiesByDate(date);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOneActivity(@Param('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateActivity(
    @Body() activity: Activity,
    @Param('id') id: string,
  ): Promise<Activity> {
    return this.activityService.updateById(id, activity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteActivity(@Param('id') id: string): Promise<any> {
    return this.activityService.deleteActivity(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/monthYear/bookedTimePerDay')
  getBookedTimePerDayOfMonthYear(
    @Body() body: MonthYear,
    @Req() request: Request,
  ): Promise<Record<string, number>> {
    const user = request.user as { userId: string; username: string };
    return this.activityService.getBookedTimePerDayOfMonthYear(
      body.month,
      body.year,
      user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteAll/:date')
  deleteActivitiesOfUserDay(
    @Param('date') date: string,
    @Req() request: Request,
  ) {
    const user = request.user as { userId: string; username: string };
    return this.activityService.deleteActivitiesOfUserDay(user.userId, date);
  }
}
