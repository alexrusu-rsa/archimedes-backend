import { MigrationInterface, QueryRunner } from 'typeorm';

export class contractSignDate1657531298534 implements MigrationInterface {
  name = 'contractSignDate1657531298534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" ADD "contractSignDate" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "contractSignDate"`,
    );
  }
}
