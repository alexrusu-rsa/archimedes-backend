import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInternaColumn1656233423983 implements MigrationInterface {
  name = 'addInternaColumn1656233423983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "internal" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "internal"`);
  }
}
