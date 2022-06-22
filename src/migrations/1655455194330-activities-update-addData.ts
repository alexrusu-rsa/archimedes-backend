import { DateFormatService } from 'src/date-format/date-format.service';
import { Activity } from '../entity/activity.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class activitiesUpdateAddData1655455194330
  implements MigrationInterface
{
  name = 'activityEntityUpdate1655455194330';
  constructor(private dateFormatService: DateFormatService) {}
  public async up(queryRunner: QueryRunner): Promise<void> {
    const activities = await queryRunner.manager.find(Activity);
    const updatedActivities = activities.map((activity) => {
      const startTime = this.dateFormatService.getNewDateWithTime(
        activity.start,
      );
      const endTime = this.dateFormatService.getNewDateWithTime(activity.end);
      activity.end;

      const workedTime = this.dateFormatService.millisecondsToHoursAndMinutes(
        startTime.getTime() - endTime.getTime(),
      );
      activity.workedTime = workedTime.hours + ': ' + workedTime.minutes;
      return activity;
    });
    await queryRunner.manager.save(updatedActivities);
    await queryRunner.commitTransaction();
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "activity" SET "workedTime" = null`);
  }
}
