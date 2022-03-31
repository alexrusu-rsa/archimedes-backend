import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { Customer } from 'src/entity/customer.entity';
import { CustomerService } from './customer.service';

@Controller()
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  getAllCustomers() {
    return this.customerService.getCustomers();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  addCustomer(@Body() customer: Customer) {
    return this.customerService.addCustomer(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  deleteCustomer(@Param() customerId: string) {
    return this.customerService.deleteCustomer(customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
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
