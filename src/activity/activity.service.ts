import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ActivityType } from 'src/custom/activity-type.enum';
import { Activity } from 'src/entity/activity.entity';
import {
  Between,
  DeleteResult,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { ActivityDuplicateRange } from 'src/custom/activity-duplicate-range';
import { ProjectService } from 'src/project/project.service';
import { BookedDay } from 'src/custom/booked-day';
import { UserWithActivities } from 'src/custom/user-with-activities';
import { User } from 'src/entity/user.entity';
import { UserTimeBooked } from 'src/custom/user-date-timebooked';
import { WidgetDay } from 'src/custom/widget-day';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
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
          projectId: duplicateActivityRange.activity.project?.id
            ? duplicateActivityRange.activity.project.id
            : null,
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
      if (!(activity.date instanceof Date)) {
        activity.date = new Date(activity.date);
      }

      activity.date.setDate(activity.date.getDate());
      activity.date.setHours(0, 0, 0, 0);

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
      console.log(dateToFind);
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
      console.log('searchDate', searchDate);
      console.log('dateParam', date);
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

  async getActivitiesOfMonthYearOfUser(month: number, year: number) {
    try {
      const activities = await this.activityRepository.find({
        where: {
          employeeId: '',
        },
      });

      const filteredActivities = activities.filter((activity) => {
        const [activityMonth, activityYear] = [
          activity.date.getUTCMonth(),
          activity.date.getUTCFullYear(),
        ];

        return activityMonth === month && activityYear === year;
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

  async getActivitiesOfMonthYearAllUsers(
    month: number,
    year: number,
  ): Promise<BookedDay[]> {
    try {
      //find all users which activities are to be counted for reporting page
      const users = await this.userRepository.find();

      if (!users || users.length === 0) return [];

      //find first and last day of the month for searching for activities in this interval
      const { firstDay, lastDay } = this.getFirstAndLastDayOfMonth(year, month);

      //get an array of users, with all their activities between firstDay and lastDay of the month selected
      const usersWithActivities = await Promise.all(
        users.map(async ({ password, ...user }) => {
          const activities = await this.activityRepository.find({
            where: {
              date: Between(firstDay, lastDay),
              employeeId: user.id,
            },
          });
          return { user, activities };
        }),
      );

      //count the days of the selected month
      const numberOfDays =
        (lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24) + 1;

      //initialize an array of BookedDay objects, containing reporting data about each day of the month
      const calendarDays: BookedDay[] = Array.from(
        { length: numberOfDays },
        (_, i) => {
          const date = new Date(year, month - 1, i + 1);
          return {
            date,
            usersTimeBooked: [],
            timeBooked: '',
            expectedHours: 0,
          };
        },
      );

      // for each day in the selected month add data about each individual user reported activities in terms of time and expected time
      // also data for workedTime VS expectedTime is calculated for each individual user as well as totals
      calendarDays.forEach((day) => {
        const { totalHours, totalMinutes, expectedHours } =
          usersWithActivities.reduce(
            (acc, { user, activities }) => {
              const dayActivities = activities.filter((activity) => {
                const activityDate = new Date(activity.date);
                activityDate.setDate(activityDate.getDate());
                return (
                  activityDate.toISOString().split('T')[0] ===
                  day.date.toISOString().split('T')[0]
                );
              });

              const { hours, minutes } = dayActivities.reduce(
                (timeAcc, activity) => {
                  const [activityHours, activityMinutes] = activity.workedTime
                    .split(':')
                    .map(Number);
                  return {
                    hours: timeAcc.hours + activityHours,
                    minutes: timeAcc.minutes + activityMinutes,
                  };
                },
                { hours: 0, minutes: 0 },
              );

              const totalActivityHours = hours + Math.floor(minutes / 60);
              const totalActivityMinutes = minutes % 60;

              day.usersTimeBooked.push({
                user: { user, activities: dayActivities },
                timeBooked: `${totalActivityHours}:${totalActivityMinutes}`,
              });

              acc.totalHours += totalActivityHours;
              acc.totalMinutes += totalActivityMinutes;

              const timePerDay = parseInt(user.timePerDay as string, 10);
              if (isNaN(timePerDay)) {
                throw new Error(
                  `Unable to parse timePerDay value: ${user.timePerDay}`,
                );
              }
              acc.expectedHours += timePerDay;

              return acc;
            },
            { totalHours: 0, totalMinutes: 0, expectedHours: 0 },
          );

        day.timeBooked = `${totalHours + Math.floor(totalMinutes / 60)}:${
          totalMinutes % 60
        }`;
        day.expectedHours = expectedHours;
      });
      return calendarDays;
    } catch (err) {
      throw err;
    }
  }

  async getBookedTimePerDayOfMonthYear(
    month: number,
    year: number,
    userId: string,
  ): Promise<WidgetDay[]> {
    try {
      const { firstDay, lastDay } = this.getFirstAndLastDayOfMonth(year, month);

      const activities = await this.activityRepository.find({
        where: {
          employeeId: userId,
          date: Between(firstDay, lastDay),
        },
      });

      const numberOfDays =
        (lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24) + 1;

      const widgetDays = Array.from({ length: numberOfDays }, (_, i) => {
        const date = new Date(year, month - 1, i + 1);
        return {
          date,
          timeBooked: '',
        };
      });

      widgetDays.forEach((day) => {
        const dayActivities = activities.filter((activity) => {
          const activityDate = new Date(activity.date);
          activityDate.setDate(activityDate.getDate());
          return (
            activityDate.toISOString().split('T')[0] ===
            day.date.toISOString().split('T')[0]
          );
        });

        let bookedHours = 0;
        let bookedMinutes = 0;
        dayActivities.forEach((activity) => {
          const hours = activity.workedTime.split(':')[0];
          const minutes = activity.workedTime.split(':')[1];
          bookedHours += parseInt(hours);
          bookedMinutes += parseInt(minutes);
        });

        const computedHours = bookedHours + bookedMinutes / 60;
        const computedMinutes = bookedMinutes + (bookedMinutes % 60);
        day.timeBooked = `${computedHours}:${computedMinutes}`;
      });
      return widgetDays;
    } catch (err) {
      throw err;
    }
  }

  getFirstAndLastDayOfMonth(
    year: number,
    month: number,
  ): { firstDay: Date; lastDay: Date } {
    const firstDay = new Date(year, month - 1, 1);

    const lastDay = new Date(year, month, 0);

    return { firstDay, lastDay };
  }
}
