import { MigrationInterface, QueryRunner } from 'typeorm';

export class DueDate1721741701082 implements MigrationInterface {
  name = 'DueDate1721741701082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "dueDate"`);
    await queryRunner.query(`ALTER TABLE "project" ADD "dueDate" DATE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "dueDate"`);
    await queryRunner.query(
      `ALTER TABLE "project" ADD "dueDate" character varying`,
    );
  }
}
