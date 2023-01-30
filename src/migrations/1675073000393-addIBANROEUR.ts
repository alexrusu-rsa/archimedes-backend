import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIBANROEUR1675073000393 implements MigrationInterface {
  name = 'addIBANROEUR1675073000393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "IBANRO" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "IBANEUR" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "IBANEUR"`);
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "IBANRO"`);
  }
}
