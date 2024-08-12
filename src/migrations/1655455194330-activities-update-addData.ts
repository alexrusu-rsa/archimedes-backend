import { DateFormatService } from '../date-format/date-format.service';
import { Activity } from '../entity/activity.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { Inject } from '@nestjs/common';
import { HoursAndMinutes } from '../custom/hours_minutes';
// import { HoursAndMinutes } from '../custom/hours_minutes';
export class activitiesUpdateAddData1655455194330
  implements MigrationInterface
{
  name = 'activityEntityUpdate1655455194330';
  constructor(@Inject() private dateFormatService: DateFormatService) {}
  getNewDateWithTime(time: string): Date {
    const newDate = new Date();
    newDate.setTime(this.toMilliseconds(time));
    return newDate;
  }
  toMilliseconds(time: string): number {
    const hoursAndMinutes = time.split(':');
    const hours = Number(hoursAndMinutes[0]);
    const minutes = Number(hoursAndMinutes[1]);
    return (
      this.hoursToMilliseconds(hours) + this.minutesToMilliseconds(minutes)
    );
  }
  hoursToMilliseconds(hours: number): number {
    return 3600 * 1000 * hours;
  }

  minutesToMilliseconds(minutes: number): number {
    return 60000 * minutes;
  }
  millisecondsToSeconds(milliseconds: number): number {
    return milliseconds / 1000;
  }

  secondsToMinutes(seconds: number): number {
    return seconds / 60;
  }

  minutesToHours(minutes: number): number {
    return minutes / 60;
  }
  millisecondsToHoursAndMinutes(milliseconds: number): HoursAndMinutes {
    const seconds = this.millisecondsToSeconds(milliseconds);
    const minutes = this.secondsToMinutes(seconds);
    const hours = Math.floor(this.minutesToHours(minutes));
    const finalMinutes = minutes - hours * 60;
    return new HoursAndMinutes(hours, finalMinutes);
  }
  public async up(queryRunner: QueryRunner): Promise<void> {
    const activities = await queryRunner.manager.find(Activity);
    const updatedActivities = activities.map((activity) => {
      const startTime = activity.start;
      const endTime = activity.end;

      const workedTime = this.millisecondsToHoursAndMinutes(
        endTime.getTime() - startTime.getTime(),
      );
      activity.workedTime = workedTime.hours + ': ' + workedTime.minutes;
      return activity;
    });
    await queryRunner.startTransaction();
    await queryRunner.manager.save(updatedActivities);
    await queryRunner.commitTransaction();
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "activity" SET "workedTime" = null`);
  }
}
