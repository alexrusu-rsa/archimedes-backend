import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomerModelEdit1724170409489 implements MigrationInterface {
  name = 'CustomerModelEdit1724170409489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerName" TO "name"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerCUI" TO "CUI"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerReg" TO "Reg"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerAddress" TO "address"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerCity" TO "city"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerCountry" TO "country"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerDirectorName" TO "directorName"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerDirectorTel" TO "directorTel"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "customerDirectorEmail" TO "directorEmail"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "name" TO "customerName"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "CUI" TO "customerCUI"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "Reg" TO "customerReg"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "address" TO "customerAddress"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "city" TO "customerCity"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "country" TO "customerCountry"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "directorName" TO "customerDirectorName"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "directorTel" TO "customerDirectorTel"
    `);

    await queryRunner.query(`
        ALTER TABLE customer
        RENAME COLUMN "directorEmail" TO "customerDirectorEmail"
    `);
  }
}
