import { MigrationInterface, QueryRunner } from 'typeorm';

export class notNullRemoved1658136267041 implements MigrationInterface {
  name = 'notNullRemoved1658136267041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "invoiceTerm"`);
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "contractSignDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorName" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorTel" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorEmail" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorName" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorTel" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorEmail" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorEmail" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorTel" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorEmail" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorTel" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ALTER COLUMN "customerDirectorName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD "contractSignDate" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "project" ADD "invoiceTerm" integer`);
  }
}
