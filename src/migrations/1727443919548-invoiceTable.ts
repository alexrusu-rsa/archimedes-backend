import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvoiceTable1727443919548 implements MigrationInterface {
  name = 'InvoiceTable1727443919548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lastSavedInvoiceNumber" character varying NOT NULL, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "invoice"`);
  }
}
