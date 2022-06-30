import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInternalBooleanColumn1656326889320
  implements MigrationInterface
{
  name = 'addInternalBooleanColumn1656326889320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "internal"`);
    await queryRunner.query(`ALTER TABLE "customer" ADD "internal" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "internal"`);
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "internal" character varying`,
    );
  }
}
