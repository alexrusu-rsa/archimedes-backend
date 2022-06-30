import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDataInternalColumn1656235058276 implements MigrationInterface {
  name = 'addDataInternalColumn1656235058276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "customer" SET "internal" = 'NO'`);
    await queryRunner.query(
      `UPDATE "customer" SET "internal" = 'YES' WHERE "customerName" = 'RSA SOFT' `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "customer" SET "internal" = null`);
  }
}
