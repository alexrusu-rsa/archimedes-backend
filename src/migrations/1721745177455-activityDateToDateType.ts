import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityDateToDateType1721745177455 implements MigrationInterface {
  name = 'ActivityDateToDateType1721745177455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add a temporary column to store times in TIMESTAMP format
    await queryRunner.query(`
        ALTER TABLE activity
        ADD COLUMN temp_start TIMESTAMP,
        ADD COLUMN temp_end TIMESTAMP,
        ADD COLUMN temp_date DATE;
    `);

    await queryRunner.query(`
        UPDATE activity
        SET temp_date = TO_DATE("date", 'DD/MM/YYYY');
    `);

    // Step 2: Convert the string times to TIMESTAMP format and store them in the temporary columns
    await queryRunner.query(`
        UPDATE activity
        SET temp_start = TO_TIMESTAMP(TO_CHAR(temp_date, 'YYYY-MM-DD') || ' ' || "start", 'YYYY-MM-DD HH24:MI'),
            temp_end = TO_TIMESTAMP(TO_CHAR(temp_date, 'YYYY-MM-DD') || ' ' || "end", 'YYYY-MM-DD HH24:MI');
    `);

    // Step 3: Drop the old string time columns
    await queryRunner.query(`
        ALTER TABLE activity
        DROP COLUMN "start",
        DROP COLUMN "end",
        DROP COLUMN "date";
    `);

    // Step 4: Rename the temporary timestamp columns to the original column names
    await queryRunner.query(`
        ALTER TABLE activity
        RENAME COLUMN temp_start TO "start";
    `);

    await queryRunner.query(`
        ALTER TABLE activity
        RENAME COLUMN temp_end TO "end";
    `);

    await queryRunner.query(`
        ALTER TABLE activity
        RENAME COLUMN temp_date TO "date";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add the old columns back as VARCHAR to store the original data
    await queryRunner.query(`
        ALTER TABLE activity
        ADD COLUMN temp_date VARCHAR,
        ADD COLUMN temp_start VARCHAR,
        ADD COLUMN temp_end VARCHAR;
    `);

    // Step 2: Repopulate the old columns from the timestamp columns
    await queryRunner.query(`
        UPDATE activity
        SET temp_date = TO_CHAR("date", 'DD/MM/YYYY'),
            temp_start = TO_CHAR("start", 'HH24:MI'),
            temp_end = TO_CHAR("end", 'HH24:MI');
    `);

    // Step 3: Drop the new timestamp columns
    await queryRunner.query(`
        ALTER TABLE activity
        DROP COLUMN "date",
        DROP COLUMN "start",
        DROP COLUMN "end";
    `);

    // Step 4: Rename the temporary columns back to their original names
    await queryRunner.query(`
        ALTER TABLE activity
        RENAME COLUMN temp_date TO "date";
    `);

    await queryRunner.query(`
        ALTER TABLE activity
        RENAME COLUMN temp_start TO "start";
    `);

    await queryRunner.query(`
        ALTER TABLE activity
        RENAME COLUMN temp_end TO "end";
    `);
  }
}
