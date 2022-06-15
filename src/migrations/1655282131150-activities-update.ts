import { createConnection } from 'typeorm';
import { DateFormatService } from 'src/date-format/date-format.service';
import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { User } from 'src/entity/user.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { connect } from 'http2';

export class activitiesUpdate1655282131150 implements MigrationInterface {
  name = 'activityEntityUpdate1655282131150';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "activity" SET "workedTime" = 'ABCDEF'`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "activity" SET "workedTime" = null`);
  }
}
