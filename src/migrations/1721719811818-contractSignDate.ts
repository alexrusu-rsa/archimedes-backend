import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContractSignDate1721719811818 implements MigrationInterface {
  name = 'ContractSignDate1721719811818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "contractSignDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD "contractSignDate" DATE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "contractSignDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD "contractSignDate" character varying`,
    );
  }
}
