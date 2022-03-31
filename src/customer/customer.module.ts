import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { CustomerProvider } from 'src/providers/customer.provider';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomerController],
  providers: [...CustomerProvider, CustomerService],
})
export class CustomerModule {}
