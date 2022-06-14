import { DateFormatService } from 'src/date-format/date-format.service';
import { Activity } from 'src/entity/activity.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class activityEntityUpdate1655213086078 implements MigrationInterface {
  constructor(private dateFormatService: DateFormatService) {}
  name = 'activityEntityUpdate1655213086078';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "workedTime" integer NULL`,
    );
    const activities = await queryRunner.manager.find(Activity);
    const updatedActivities = activities.map((activity) => {
      const startDateTime = this.dateFormatService.getNewDateWithTime(
        activity.start,
      );
      const endDateTime = this.dateFormatService.getNewDateWithTime(
        activity.end,
      );
      activity.workedTime =
        this.dateFormatService.millisecondsToHoursAndMinutes(
          endDateTime.getTime() - startDateTime.getTime(),
        );
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "workedTime"`);
  }
}
