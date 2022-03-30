import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Customer } from 'src/entity/customer.entity';
import { CustomerService } from './customer.service';

@Controller()
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  getAllCustomers() {
    return this.customerService.getCustomers();
  }

  @Post()
  addCustomer(@Body() customer: Customer) {
    return this.customerService.addCustomer(customer);
  }

  @Delete(':id')
  deleteCustomer(@Param() customerId: string) {
    return this.customerService.deleteCustomer(customerId);
  }

  @Put(':id')
  updateCustomer(
    @Param() customerToUpdateId: string,
    @Body() customer: Customer,
  ) {
    return this.customerService.updateCustomerById(
      customerToUpdateId,
      customer,
    );
  }
}
