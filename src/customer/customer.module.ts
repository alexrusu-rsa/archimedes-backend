import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { DateFormatService } from 'src/date-format/date-format.service';
import { ActivityProvider } from 'src/providers/activity.provider';
import { CustomerProvider } from 'src/providers/customer.provider';
import { ProjectProvider } from 'src/providers/project.provider';
import { RateProvider } from 'src/providers/rate.provider';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PdfInvoiceService } from 'src/pdf-invoice/pdf-invoice.service';
import { InvoiceProvider } from 'src/providers/invoice.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomerController],
  providers: [
    ...CustomerProvider,
    ...ProjectProvider,
    ...RateProvider,
    ...ActivityProvider,
    ...InvoiceProvider,
    CustomerService,
    PdfInvoiceService,
    DateFormatService,
  ],
})
export class CustomerModule {}
