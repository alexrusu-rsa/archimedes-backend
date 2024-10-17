import { DatabaseModule } from 'src/database.module';
import { InvoiceProvider } from 'src/providers/invoice.provider';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Module } from '@nestjs/common';
@Module({
  imports: [DatabaseModule],
  controllers: [InvoiceController],
  providers: [...InvoiceProvider, InvoiceService],
})
export class InvoiceModule {}
