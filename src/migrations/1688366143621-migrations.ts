import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1688366143621 implements MigrationInterface {
  name = 'migrations1688366143621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" RENAME COLUMN "SWIFT" TO "swift"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" RENAME COLUMN "swift" TO "SWIFT"`,
    );
  }
}
