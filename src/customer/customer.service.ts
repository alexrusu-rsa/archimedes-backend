import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/entity/customer.entity';
import { DeleteResult, InsertResult, Repository } from 'typeorm';

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

  async addCustomer(customer: Customer): Promise<InsertResult> {
    try {
      const insertionResult = this.customerRepository.insert(customer);
      if (insertionResult) return insertionResult;
      throw new HttpException(
        'Customer insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteCustomer(customerId: string): Promise<DeleteResult> {
    try {
      const customerToDelete = await this.customerRepository.findOne(
        customerId,
      );
      if (customerToDelete) {
        const deletionResult = this.customerRepository.delete(customerId);
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
      const toUpdateCustomer = await this.customerRepository.findOne(id);
      if (toUpdateCustomer) {
        const updatedCustomer = await this.customerRepository.update(
          id,
          customer,
        );
        if (updatedCustomer) return this.customerRepository.findOne(id);
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
