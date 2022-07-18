import { MigrationInterface, QueryRunner } from 'typeorm';

export class rateTableMigration1657618841598 implements MigrationInterface {
  name = 'rateTableMigration1657618841598';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectId" character varying NOT NULL, "employeeId" character varying NOT NULL, "rate" integer, "rateType" character varying, "employeeTimeCommitement" integer, CONSTRAINT "PK_2618d0d38af322d152ccc328f33" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rate"`);
  }
}
