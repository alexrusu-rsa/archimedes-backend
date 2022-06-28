import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInternalColumnBooleanData1656327763680
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "customer" SET "internal" = FALSE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "customer" SET "internal" = null `);
  }
}
