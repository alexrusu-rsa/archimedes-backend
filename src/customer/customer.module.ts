import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { DateFormatService } from 'src/date-format/date-format.service';
import { PdfInvoiceService } from 'src/pdf-invoice/pdf-invoice.service';
import { ProjectModule } from 'src/project/project.module';
import { CustomerProvider } from 'src/providers/customer.provider';
import { ProjectProvider } from 'src/providers/project.provider';
import { XlsxInvoiceService } from 'src/xlsx-invoice/xlsx-invoice.service';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomerController],
  providers: [
    ...CustomerProvider,
    ...ProjectProvider,
    CustomerService,
    XlsxInvoiceService,
    PdfInvoiceService,
    DateFormatService,
  ],
})
export class CustomerModule {}
