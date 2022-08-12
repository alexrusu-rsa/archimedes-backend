import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCustomerShortName1660213151924 implements MigrationInterface {
  name = 'addCustomerShortName1660213151924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "shortName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "shortName"`);
  }
}
