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
import { User } from 'src/entity/user.entity';
import { async } from 'rxjs';
import { BookedDay } from 'src/custom/booked-day';
import { UserDateTimeBooked } from 'src/custom/user-date-time-booked';
import { UserWithActivities } from 'src/custom/user-with-activities';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
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
          return { ...activity, project: projectId ? project : null };
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
      const activities = await this.activityRepository.find({
        where: {
          employeeId: userId,
        },
      });

      const filteredActivities = activities.filter((activity) => {
        const [day, activityMonth, activityYear] = activity?.date.split('/');

        if (activityMonth[0] !== '0')
          return activityMonth === month && activityYear === year;
        return activityMonth[1] === month && activityYear === year;
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
        const activityDate = this.parseDate(activity.date);
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

  async getActivitiesOfMonthYearAllUsers(
    month: number,
    year: number,
  ): Promise<BookedDay[]> {
    try {
      const users = await this.userRepository.find();
      if (users) {
        const usersWithoutPasswords = users.map(
          ({ password, ...user }) => user,
        );

        const monthYear = month + '/' + year;

        const usersWithActivities = await Promise.all(
          usersWithoutPasswords.map(async (user) => {
            const activitiesOfUserInMonthYear =
              await this.activityRepository.find({
                where: {
                  date: Like(`%${monthYear}`),
                  employeeId: Like(`${user.id}`),
                },
              });

            return {
              user,
              activities: activitiesOfUserInMonthYear,
            };
          }),
        );

        const currentDate = new Date(year, month, 0);
        const currentYear = currentDate.getUTCFullYear();
        const currentMonth = currentDate.getUTCMonth();

        const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
        const nextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

        const numberOfDays =
          (nextMonth.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24);

        const daysArray: string[] = [];
        for (let i = 1; i <= numberOfDays; i++) {
          const dateToAdd = new Date(Date.UTC(currentYear, currentMonth, i))
            .toISOString()
            .split('T')[0];
          const dateParts = dateToAdd.split('-');
          const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
          daysArray.push(formattedDate);
        }

        const calendarDays = daysArray.map((day) => {
          return {
            bookedUsers: [] as UserDateTimeBooked[],
            date: day,
            timeBooked: '',
            expectedHours: 0,
          };
        });

        calendarDays.forEach((day: BookedDay) => {
          let allEmployeesHours = 0;
          let allEmployeesMinutes = 0;

          let expectedHours = 0;

          usersWithActivities.forEach((user: UserWithActivities) => {
            const dayActivities = user.activities.filter(
              (activity) => activity.date === day.date,
            );
            expectedHours = parseInt(user.user.timePerDay);

            let userHoursBooked = 0;
            let userMinutesBooked = 0;

            dayActivities.forEach((activity) => {
              const timeBookedString = activity.workedTime;
              const hours = parseInt(timeBookedString.split(':')[0]);
              const minutes = parseInt(timeBookedString.split(':')[1]);
              userHoursBooked += hours;
              userMinutesBooked += minutes;
            });

            const bookedHoursAllActivitiesOfDay =
              Math.floor(userMinutesBooked / 60) + userHoursBooked;
            const bookedMinutesAllActivitiesOfDay = userMinutesBooked % 60;
            day.bookedUsers.push({
              user: user,
              timeBooked: `${bookedHoursAllActivitiesOfDay}:${bookedMinutesAllActivitiesOfDay}`,
            });
            allEmployeesHours += bookedHoursAllActivitiesOfDay;
            allEmployeesMinutes += bookedMinutesAllActivitiesOfDay;
          });

          const bookedHoursAllEmployeesOfDay =
            Math.floor(allEmployeesMinutes / 60) + allEmployeesHours;
          const bookedMinutesAllEmployeesOfDay = allEmployeesMinutes % 60;
          day.timeBooked = `${bookedHoursAllEmployeesOfDay}:${bookedMinutesAllEmployeesOfDay}`;
          day.expectedHours = expectedHours;
        });

        return calendarDays;
      }
    } catch (error) {
      throw error;
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
