import { MigrationInterface, QueryRunner } from 'typeorm';

export class DueDate1721741701082 implements MigrationInterface {
  name = 'DueDate1721741701082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "project"
        ADD COLUMN "dueDateTemp" DATE;
    `);

    await queryRunner.query(`
        UPDATE "project"
        SET "dueDateTemp" = to_date("dueDate", 'DD/MM/YYYY');
    `);

    await queryRunner.query(`
        ALTER TABLE "project"
        DROP COLUMN "dueDate";
    `);

    await queryRunner.query(`
        ALTER TABLE "project"
        RENAME COLUMN "dueDateTemp" TO "dueDate";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "project"
        ADD COLUMN "dueDate" VARCHAR;
    `);

    await queryRunner.query(`
        UPDATE "project"
        SET "dueDate" = to_char("dueDateTemp", 'DD/MM/YYYY');
    `);

    await queryRunner.query(`
        ALTER TABLE "project"
        DROP COLUMN "dueDateTemp";
    `);
  }
}
