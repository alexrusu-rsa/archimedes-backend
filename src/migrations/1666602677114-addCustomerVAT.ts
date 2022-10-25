import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCustomerVAT1666602677114 implements MigrationInterface {
  name = 'addCustomerVAT1666602677114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" ADD "VAT" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "VAT"`);
  }
}
