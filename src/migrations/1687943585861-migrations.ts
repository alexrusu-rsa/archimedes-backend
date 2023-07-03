import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1687943585861 implements MigrationInterface {
  name = 'migrations1687943585861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD "SWIFT" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "SWIFT"`);
  }
}
