import { MigrationInterface, QueryRunner } from 'typeorm';

export class activityAddWorkedTimeColumn1655893988497
  implements MigrationInterface
{
  name = 'activityAddWorkedTimeColumn1655893988497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "workedTime" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "workedTime"`);
  }
}
