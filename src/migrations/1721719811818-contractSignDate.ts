import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContractSignDate1721719811818 implements MigrationInterface {
  name = 'ContractSignDate1721719811818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "project"
        ADD COLUMN "contractSignDateTemp" DATE;
    `);

    await queryRunner.query(`
        UPDATE "project"
        SET "contractSignDateTemp" = to_date("contractSignDate", 'DD/MM/YYYY');
    `);

    await queryRunner.query(`
        ALTER TABLE "project"
        DROP COLUMN "contractSignDate";
    `);

    await queryRunner.query(`
        ALTER TABLE "project"
        RENAME COLUMN "contractSignDateTemp" TO "contractSignDate";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "project"
        ADD COLUMN "contractSignDate" VARCHAR;
    `);

    await queryRunner.query(`
        UPDATE "project"
        SET "contractSignDate" = to_char("contractSignDateTemp", 'DD/MM/YYYY');
    `);

    await queryRunner.query(`
        ALTER TABLE "project"
        DROP COLUMN "contractSignDateTemp";
    `);
  }
}
