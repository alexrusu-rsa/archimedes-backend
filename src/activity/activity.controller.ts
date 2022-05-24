import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { Activity } from 'src/entity/activity.entity';
import { ActivityService } from './activity.service';

@Controller()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllActivities(): Promise<Activity[]> {
    return this.activityService.getActivities();
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
  @Roles(Role.Admin)
  @Get('/range')
  getActivitiesInRange(
    @Query('startDate') startDate,
    @Query('endDate') endDate,
  ) {
    return this.activityService.getActivitiesInRange(startDate, endDate);
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
}
