import { MigrationInterface, QueryRunner } from 'typeorm';

export class invoiceTermAdded1657265082023 implements MigrationInterface {
  name = 'invoiceTermAdded1657265082023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" ADD "invoiceTerm" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "invoiceTerm"`);
  }
}
