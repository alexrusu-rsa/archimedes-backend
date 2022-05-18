import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ActivityType } from 'src/entity/activity-type.enum';
import { Activity } from 'src/entity/activity.entity';
import {
  DeleteResult,
  getConnection,
  getRepository,
  Like,
  Repository,
} from 'typeorm';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
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
      const activitiesEmployeeDate = await getConnection()
        .createQueryBuilder()
        .select('activity')
        .from(Activity, 'activity')
        .where('activity.date = :date', { date: date })
        .andWhere('activity.employeeId = :employeeId', { employeeId: id })
        .getMany();
      if (activitiesEmployeeDate) return activitiesEmployeeDate;
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

  filterActivitiesInRange(
    activities: Activity[],
    startDate: string,
    endDate: string,
  ): Activity[] {
    const filteredActivities: Activity[] = [];
    const startDateDay = startDate[0] + startDate[1];
    const startDateMonth = startDate[2] + startDate[3];
    const startDateYear =
      startDate[4] + startDate[5] + startDate[6] + startDate[7];

    const endDateDay = endDate[0] + endDate[1];
    const endDateMonth = endDate[2] + endDate[3];
    const endDateYear = endDate[4] + endDate[5] + endDate[6] + endDate[7];

    const startDateISO =
      startDateYear + '-' + startDateMonth + '-' + startDateDay;
    const endDateISO = endDateYear + '-' + endDateMonth + '-' + endDateDay;
    const start = new Date(startDateISO);
    const end = new Date(endDateISO);

    activities.forEach(function (activity) {
      const activityDate = activity.date.split('/');
      const activityDateISO =
        activityDate[2] + '-' + activityDate[1] + '-' + activityDate[0];
      const dateToCheck = new Date(activityDateISO);
      if (dateToCheck <= end && dateToCheck >= start) {
        filteredActivities.push(activity);
      }
    });
    return filteredActivities;
  }

  async getActivitiesInRange(startDate: string, endDate: string) {
    try {
      const activities = await this.activityRepository.find();
      if (activities) {
        const activitiesInRange = this.filterActivitiesInRange(
          activities,
          startDate,
          endDate,
        );
        return activitiesInRange;
      }
      throw new HttpException(
        'We could not find the activites!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
}
