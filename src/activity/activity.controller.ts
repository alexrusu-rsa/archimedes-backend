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
import { ActivityDuplicateRange } from 'src/custom/activity-duplicate-range';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { Activity } from 'src/entity/activity.entity';
import { ActivityService } from './activity.service';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
@ApiTags('Activity')
@Controller()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all activities',
    description: 'Fetch a list with all activities.',
  })
  @Get()
  getAllActivities(): Promise<Activity[]> {
    return this.activityService.getActivities();
  }

  @Post('/duplicate')
  @ApiOperation({
    summary: 'Duplicate an activity',
    description:
      'Creates a copy of an activity in all dates in the range given as request body.',
  })
  @ApiBody({
    type: ActivityDuplicateRange,
    description: 'Range in which the activity is to be duplicated.',
  })
  duplicateActivityInDateRange(
    @Body() activityDuplicateRange: ActivityDuplicateRange,
  ) {
    return this.activityService.addActivitiesInRange(activityDuplicateRange);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/date')
  @ApiOperation({
    summary: 'Get list of activities of employee on certain date',
    description:
      'Fetch a list with activities of a certain employee in a specific date based unique employee ID and date.',
  })
  @ApiBody({
    type: RequestWrapper,
    description: 'Body should contain a date, and the user unique ID',
  })
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
  @ApiOperation({
    summary: 'Get a list of activity types',
    description: 'Fetch a list with available activity types.',
  })
  getAvailableActivityTypes() {
    return this.activityService.getActivityTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':year/:month')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Get all activities of a month in a certain year',
    description: 'Fetch a list of activities in a given month and year.',
  })
  @ApiParam({ name: 'year', description: 'The year of the activities' })
  @ApiParam({ name: 'month', description: 'The month of the activities' })
  getActivitiesOfMonthYear(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.activityService.getActivitiesMonthYear(year, month);
  }

  @Post('/employee')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Get a list of activities from a certain employee',
    description: 'Fetch a list with activities of a specified employee.',
  })
  @ApiBody({
    type: RequestWrapper,
    description: 'Body should contain a specific user unique ID',
  })
  getActivitiesOfEmployee(
    @Body() request: RequestWrapper,
  ): Promise<Activity[]> {
    return this.activityService.getActivitiesByEmployeeId(request.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Add a new activity',
    description:
      'Adds the activity present in the request body to the database.',
  })
  @ApiBody({
    type: Activity,
    description: 'Body should contain an Activity object.',
  })
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
  @ApiOperation({
    summary: 'Get a specific activity',
    description: 'Fetch a specific activity by the unique ID parameter.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique activity ID',
  })
  getOneActivity(@Param('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Update specific activity details',
    description: 'Updates a specific activity with the one in request body.',
  })
  @ApiBody({
    type: Activity,
    description:
      'The updated Activity that we want to replace the older one with.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the activity that we want to update.',
  })
  updateActivity(
    @Body() activity: Activity,
    @Param('id') id: string,
  ): Promise<Activity> {
    return this.activityService.updateById(id, activity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an activity',
    description: 'Deletes a specific activity based on the specified ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique Id of activity that will be deleted.',
  })
  deleteActivity(@Param('id') id: string): Promise<any> {
    return this.activityService.deleteActivity(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/monthYear')
  getActivitiesOfUser(@Body() body: any): Promise<Activity[]> {
    return this.activityService.getActivitiesOfMonthYearOfUser(
      body.month,
      body.year,
      body.userId,
    );
  }
  
  @Delete(':userId/:date')
  @ApiOperation({
    summary: 'Delete all activities of a certain day',
    description:
      'Deletes all existent activities of a specified user in a certain date.',
  })
  deleteActivitiesOfUserDay(
    @Param('userId') userId: string,
    @Param('date') date: string,
  ): Promise<any> {
    return this.activityService.deleteActivitiesOfUserDay(userId, date);
  }
}
