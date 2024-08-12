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
    return Object.values(ActivityType);
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
    date.setDate(startDateType.getDate());
    date.setMonth(startDateType.getMonth());
    date.setFullYear(startDateType.getFullYear());

    const whileStop = new Date();
    whileStop.setDate(endDateType.getDate());
    whileStop.setMonth(endDateType.getMonth());
    whileStop.setFullYear(endDateType.getFullYear());

    const dates = [];

    const startDate = new Date(duplicateActivityRange.activity.start);
    const endDate = new Date(duplicateActivityRange.activity.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format in duplicateActivityRange.activity');
    }
    const startHours = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();

    while (date <= whileStop) {
      if (!(await this.isWeekend(date))) {
        dates.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    try {
      dates.forEach(async (date: Date) => {
        const combinedStartDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startHours,
          startMinutes,
          0,
          0,
        );
        const combinedEndDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          endHours,
          endMinutes,
          0,
          0,
        );
        const activity = <Activity>{
          name: duplicateActivityRange.activity.name,
          date: date,
          start: combinedStartDate,
          end: combinedEndDate,
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
      ) {
        throw new HttpException(
          'Make sure you add required information about the activity!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      const startTime = new Date(activity.start);
      const endTime = new Date(activity.end);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new HttpException(
          'Invalid date format provided!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const differenceInMilliseconds = endTime.getTime() - startTime.getTime();

      const totalMinutes = Math.floor(differenceInMilliseconds / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');

      activity.workedTime = `${formattedHours}:${formattedMinutes}`;
      const newActivityId: string = (
        await this.activityRepository.insert(activity)
      ).identifiers[0]?.id;

      if (newActivityId) {
        const project = await this.projectService.getProjectById(
          activity.projectId,
        );
        const { projectId, ...activityWithoutProjectId } =
          await this.activityRepository.findOneBy({ id: newActivityId });
        return {
          ...activityWithoutProjectId,
          project: activity?.projectId ? project : null,
        };
      }

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
      const startTime = new Date(activity.start);
      const endTime = new Date(activity.end);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new HttpException(
          'Invalid date format provided!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const differenceInMilliseconds = endTime.getTime() - startTime.getTime();

      const totalMinutes = Math.floor(differenceInMilliseconds / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');

      activity.workedTime = `${formattedHours}:${formattedMinutes}`;

      if (toUpdateActivity) {
        const updatedActivity = await this.activityRepository.update(
          id,
          activity,
        );

        if (updatedActivity) {
          const project = await this.projectService.getProjectById(
            activity.projectId,
          );
          const { projectId, ...activityWithoutProjectId } =
            await this.activityRepository.findOneBy({ id });
          return {
            ...activityWithoutProjectId,
            project: activity?.projectId ? project : null,
          };
        }
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
    date: Date,
    id: string,
  ): Promise<Activity[]> {
    try {
      // Convert to Date object if it's not already
      const parsedDate = date instanceof Date ? date : new Date(date);

      // Check if the conversion resulted in a valid date
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid Date');
      }

      const searchDate = `${parsedDate.getFullYear()}-${String(
        parsedDate.getMonth() + 1,
      ).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;

      const activities = await getConnection()
        .createQueryBuilder()
        .select('activity')
        .from(Activity, 'activity')
        .where('activity.date = :date', { date: searchDate })
        .andWhere('activity.employeeId = :employeeId', { employeeId: id })
        .getMany();

      const activityWithProject = await Promise.all(
        activities.map(async (activity) => {
          const project = await this.projectService.getProjectById(
            activity.projectId,
          );
          const { projectId, ...activityWithoutProjectId } = activity;
          return {
            ...activityWithoutProjectId,
            project: projectId ? project : null,
          };
        }),
      );

      if (activityWithProject) return activityWithProject;
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
      const searchMonth = parseInt(month, 10);
      const searchYear = parseInt(year, 10);

      const activitiesOfTheMonthYear = await getRepository(Activity)
        .createQueryBuilder('activity')
        .where('EXTRACT(MONTH FROM activity.date) = :month', { searchMonth })
        .andWhere('EXTRACT(YEAR FROM activity.date) = :year', { searchYear })
        .getMany();

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
      const activities = await this.activityRepository.find({
        where: {
          employeeId: userId,
        },
      });

      const filteredActivities = activities.filter((activity) => {
        const [day, activityMonth, activityYear] = [
          activity.date.getUTCDate(),
          activity.date.getUTCMonth(),
          activity.date.getUTCFullYear(),
        ];

        return (
          activityMonth.toString() === month && activityYear.toString() === year
        );
      });

      if (filteredActivities) return filteredActivities;
      throw new HttpException(
        'We could not find the activites!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getBookedTimePerDayOfMonthYear(
    month: number,
    year: number,
    userId: string,
  ): Promise<Record<string, number>> {
    try {
      const activities = await this.activityRepository.find({
        where: {
          employeeId: userId,
        },
      });

      const daysInMonth = Array.from(
        {
          length: new Date(year, month, 0).getDate(),
        },
        (_, i) => new Date(Date.UTC(year, month - 1, i + 1)),
      );

      const bookedTimePerDay: Record<string, number> = {};

      // Initialize bookedTimePerDay with 0 minutes for each day in the month
      daysInMonth.forEach((dayDate) => {
        const dateString = this.formatDate(dayDate);
        bookedTimePerDay[dateString] = 0;
      });

      // Calculate the total booked time for each day
      activities.forEach((activity) => {
        const activityDate = activity.date;
        if (
          activityDate.getUTCFullYear() === year &&
          activityDate.getUTCMonth() === month - 1
        ) {
          const dateString = this.formatDate(activityDate);
          const [hours, minutes] = activity.workedTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes;
          bookedTimePerDay[dateString] += totalMinutes;
        }
      });

      return bookedTimePerDay;
    } catch (err) {
      throw err;
    }
  }

  // Helper method to format Date object to 'dd/MM/yyyy' string
  private formatDate(date: Date): string {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // Helper method to parse 'dd/MM/yyyy' string to Date object
  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
}
