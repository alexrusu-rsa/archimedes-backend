import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/entity/customer.entity';
import { DeleteResult, Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { doc } from 'prettier';
import { table } from 'console';

@Injectable()
export class CustomerService {
  constructor(
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
  ) {}

  async getCustomers(): Promise<Customer[]> {
    try {
      const customers = this.customerRepository.find();
      if (customers) return customers;
      throw new HttpException(
        'We could not find the customers!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getCustomer(id: string): Promise<Customer> {
    try {
      const customer = this.customerRepository.findOneBy({ id });
      if (customer) return customer;
      throw new HttpException(
        'We could not find the customers!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async addCustomer(customer: Customer): Promise<Customer> {
    try {
      const newCustomerId = (await this.customerRepository.insert(customer))
        .identifiers[0]?.id;
      if (newCustomerId)
        return await this.customerRepository.findOneBy({ id: newCustomerId });

      throw new HttpException(
        'Customer insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteCustomer(id: string): Promise<DeleteResult> {
    try {
      const customerToDelete = await this.customerRepository.findOneBy({ id });
      if (customerToDelete) {
        const deletionResult = this.customerRepository.delete(id);
        if (deletionResult) {
          return deletionResult;
        }
        throw new HttpException(
          'Customer was not deleted!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Customer could not be found!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async updateCustomerById(id: string, customer: Customer): Promise<Customer> {
    try {
      const toUpdateCustomer = await this.customerRepository.findOneBy({ id });
      if (toUpdateCustomer) {
        const updatedCustomer = await this.customerRepository.update(
          id,
          customer,
        );
        if (updatedCustomer) return this.customerRepository.findOneBy({ id });
        throw new HttpException(
          'We could not update the customer!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The customer you tried to update could not be found!',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }
}
