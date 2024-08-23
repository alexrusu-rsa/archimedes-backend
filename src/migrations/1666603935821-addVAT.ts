import { Customer } from '../entity/customer.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class addVAT1666603935821 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const customers = await queryRunner.manager.find(Customer);
    const updatedCustomers = customers.map((customer) => {
      customer.vat = true;
      return customer;
    });
    await queryRunner.startTransaction();
    await queryRunner.manager.save(updatedCustomers);
    await queryRunner.commitTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "customer" SET "VAT" = null`);
  }
}
