import { Inject } from '@nestjs/common';
import { time } from 'console';
import { DateFormatService } from 'src/date-format/date-format.service';
import { Activity } from 'src/entity/activity.entity';
import {
  getRepository,
  MigrationInterface,
  QueryRunner,
  Repository,
} from 'typeorm';

export class activityEntityUpdate1655276558015 implements MigrationInterface {
  name = 'activityEntityUpdate1655276558015';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "workedTime" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "workedTime"`);
  }
}
