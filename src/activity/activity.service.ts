import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DateFormatService } from 'src/date-format/date-format.service';
import { ActivityType } from 'src/custom/activity-type.enum';
import { Activity } from 'src/entity/activity.entity';
import {
  DeleteResult,
  getConnection,
  getRepository,
  Like,
  Repository,
} from 'typeorm';
import { ActivityDuplicateRange } from 'src/custom/activity-duplicate-range';
import { ProjectService } from 'src/project/project.service';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
    private dateFormatService: DateFormatService,
    private projectService: ProjectService,
  ) {}

  async getActivities(): Promise<Activity[]> {
    try {
      const activities = this.activityRepository.find();
      if (activities) return activities;
      throw new HttpException(
        'We could not find the activites!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getActivityTypes() {
    return ActivityType;
  }

  async isWeekend(date: Date): Promise<boolean> {
    const dayOfTheWeek = date.getDay();
    if (dayOfTheWeek === 6 || dayOfTheWeek === 0) {
      return true;
    }
    return false;
  }

  async addActivitiesInRange(duplicateActivityRange: ActivityDuplicateRange) {
    const startDateType = new Date(duplicateActivityRange.startDate);
    const endDateType = new Date(duplicateActivityRange.endDate);
    const date = new Date();
    date.setDate(startDateType.getDate() + 1);
    date.setMonth(startDateType.getMonth());
    date.setFullYear(startDateType.getFullYear());
    const whileStop = new Date();
    whileStop.setDate(endDateType.getDate() + 1);
    whileStop.setMonth(endDateType.getMonth());
    whileStop.setFullYear(endDateType.getFullYear());
    const dates = [];
    while (date <= whileStop) {
      if (!(await this.isWeekend(date))) {
        dates.push(
          this.dateFormatService.formatISOToDB(
            new Date(date).toISOString().split('T')[0],
          ),
        );
      }
      date.setDate(date.getDate() + 1);
    }
    try {
      dates.forEach(async (date) => {
        const activity = <Activity>{
          name: duplicateActivityRange.activity.name,
          date: date,
          start: duplicateActivityRange.activity.start,
          end: duplicateActivityRange.activity.end,
          projectId: duplicateActivityRange.activity.projectId,
          activityType: duplicateActivityRange.activity.activityType,
          description: duplicateActivityRange.activity.description,
          extras: duplicateActivityRange.activity.extras,
          employeeId: duplicateActivityRange.activity.employeeId,
        };
        await this.addActivity(activity);
      });
    } catch (err) {
      throw err;
    }
  }

  async addActivity(activity: Activity): Promise<Activity> {
    try {
      if (
        !activity.date ||
        !activity.start ||
        !activity.employeeId ||
        !activity.end ||
        !activity.name
      )
        throw new HttpException(
          'Make sure you add required information about the activity!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      const startTime = this.dateFormatService.getNewDateWithTime(
        activity.start,
      );
      const endTime = this.dateFormatService.getNewDateWithTime(activity.end);
      const hoursAndMinutesObj =
        this.dateFormatService.millisecondsToHoursAndMinutes(
          endTime.getTime() - startTime.getTime(),
        );
      activity.workedTime =
        hoursAndMinutesObj.hours + ':' + hoursAndMinutesObj.minutes;
      const newActivityId: string = (
        await this.activityRepository.insert(activity)
      ).identifiers[0]?.id;

      if (newActivityId)
        return await this.activityRepository.findOneBy({ id: newActivityId });
      throw new HttpException(
        'Activity insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async findOne(id: string): Promise<Activity> {
    try {
      const foundActivity = this.activityRepository.findOneBy({ id });
      if (foundActivity) return foundActivity;
      throw new HttpException(
        'We could not find the activity you were searching for!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async updateById(id: string, activity: Activity): Promise<Activity> {
    try {
      const toUpdateActivity = await this.activityRepository.findOneBy({ id });
      const startTime = this.dateFormatService.getNewDateWithTime(
        activity.start,
      );
      const endTime = this.dateFormatService.getNewDateWithTime(activity.end);
      const hoursAndMinutesObj =
        this.dateFormatService.millisecondsToHoursAndMinutes(
          endTime.getTime() - startTime.getTime(),
        );
      activity.workedTime =
        hoursAndMinutesObj.hours + ':' + hoursAndMinutesObj.minutes;

      if (toUpdateActivity) {
        const updatedActivity = await this.activityRepository.update(
          id,
          activity,
        );
        if (updatedActivity) return this.activityRepository.findOneBy({ id });
        throw new HttpException(
          'We could not update the activity!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The activity you tried to update could not be found!',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async deleteActivity(id: string): Promise<DeleteResult> {
    try {
      const activityToDelete = await this.findOne(id);
      if (activityToDelete) {
        const deletionResult = this.activityRepository.delete(id);
        if (deletionResult) {
          return deletionResult;
        }
        throw new HttpException(
          'Activity was not deleted!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Activity could not be found!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteActivitiesOfUserDay(userId: string, date: string) {
    const splitDate = date.split('-');
    const formattedDate = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
    try {
      const activitiesByEmployeeIdAndDate = await getConnection()
        .createQueryBuilder()
        .select('activity')
        .from(Activity, 'activity')
        .where('activity.employeeId = :id', { id: userId })
        .andWhere('activity.date = :formattedDate', {
          formattedDate: formattedDate,
        })
        .getMany();
      if (activitiesByEmployeeIdAndDate) {
        activitiesByEmployeeIdAndDate.forEach((activity) => {
          this.deleteActivity(activity.id);
        });
      }
    } catch (err) {
      throw err;
    }
  }

  async getActivitiesByDate(dateToFind: string): Promise<Activity[]> {
    try {
      const activitiesFound = await getConnection()
        .createQueryBuilder()
        .select('activity')
        .from(Activity, 'activity')
        .where('activity.date = :date', { date: dateToFind })
        .getMany();
      if (activitiesFound) return activitiesFound;
      throw new HttpException('No activities were found', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }

  async getActivitiesByDateEmployeeId(
    date: string,
    id: string,
  ): Promise<Activity[]> {
    try {
      const activities = await getConnection()
        .createQueryBuilder()
        .select('activity')
        .from(Activity, 'activity')
        .where('activity.date = :date', { date: date })
        .andWhere('activity.employeeId = :employeeId', { employeeId: id })
        .getMany();

      const activityWithProject = await Promise.all(
        activities.map(async (activity) => {
          const project = await this.projectService.getProjectById(
            activity.projectId,
          );
          const { projectId, ...activityWithoutProjectId } = activity;
          return { ...activityWithoutProjectId, project: project };
        }),
      );
      if (activityWithProject) return activityWithProject;
      throw new HttpException('No activities were found', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }

  async getActivitiesByEmployeeId(id: string): Promise<Activity[]> {
    try {
      const activitiesByEmployeeId = await getConnection()
        .createQueryBuilder()
        .select('activity')
        .from(Activity, 'activity')
        .where('activity.employeeId = :employeeId', { employeeId: id })
        .getMany();
      if (activitiesByEmployeeId) return activitiesByEmployeeId;
      throw new HttpException(
        'No activities were found for this employee.',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getActivitiesMonthYear(year: string, month: string) {
    try {
      const monthYear = month + '/' + year;
      const activitiesOfTheMonthYear = await getRepository(Activity).find({
        where: {
          date: Like(`%${monthYear}`),
        },
      });
      if (activitiesOfTheMonthYear) return activitiesOfTheMonthYear;
    } catch (err) {
      throw err;
    }
  }

  async getActivitiesOfMonthYearOfUser(
    month: string,
    year: string,
    userId: string,
  ) {
    try {
      const monthYear = month + '/' + year;
      const activitiesOfMonthYearForUser = await getRepository(Activity).find({
        where: {
          date: Like(`%${monthYear}`),
          employeeId: Like(`${userId}`),
        },
      });
      if (activitiesOfMonthYearForUser) return activitiesOfMonthYearForUser;
    } catch (err) {
      throw err;
    }
  }
}
