import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { PdfService } from 'src/pdf/pdf.service';
import { CustomerProvider } from 'src/providers/customer.provider';
import { XlsxService } from 'src/xlsx/xlsx.service';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomerController],
  providers: [...CustomerProvider, CustomerService, XlsxService, PdfService],
})
export class CustomerModule {}
