import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { DeleteResult, getConnection, InsertResult, Repository } from 'typeorm';

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
        {
          status: HttpStatus.NOT_FOUND,
          error: 'We could not find the activites!',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
    }
  }

  async addActivity(activity: Activity): Promise<InsertResult> {
    try {
      const insertionResult = this.activityRepository.insert(activity);
      if (insertionResult) return insertionResult;
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Activity insertion failed!',
        },
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      return err;
    }
  }

  async findOne(id: string): Promise<Activity> {
    try {
      const foundActivity = this.activityRepository.findOne(id);
      if (foundActivity) return foundActivity;
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'We could not find the activity you were searching for!',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
    }
  }

  async updateById(id: string, activity: Activity): Promise<Activity> {
    try {
      const toUpdateActivity = await this.activityRepository.findOne(id);
      if (toUpdateActivity) {
        try {
          const updatedActivity = await this.activityRepository.update(
            id,
            activity,
          );
          if (updatedActivity) return this.activityRepository.findOne(id);
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'We could not update the activity!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } catch (err) {}
      } else {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'The activity you tried to update could not be found!',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      return err;
    }
  }

  async deleteActivity(id: string): Promise<DeleteResult> {
    try {
      const activityToDelete = await this.findOne(id);
      if (activityToDelete) {
        try {
          const deletionResult = this.activityRepository.delete(id);
          if (deletionResult) {
            return deletionResult;
          }
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Activity was not deleted!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } catch (err) {
          return err;
        }
      }
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Activity could not be found!',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
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
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'No activities were found',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
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
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'No activities were found',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
    }
  }
}
