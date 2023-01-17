import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRomanianCustomer1673865979280 implements MigrationInterface {
  name = 'addRomanianCustomer1673865979280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "romanianCompany" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "romanianCompany"`,
    );
  }
}
