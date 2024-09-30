import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Invoice } from 'src/entity/invoice.entity';

@Controller()
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getLastInvoiceNumber(): Promise<Invoice> {
    return this.invoiceService.getInvoiceNumber();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updateLastInvoiceNumber(@Body() invoice: Invoice): Promise<string> {
    return this.invoiceService.updateLastInvoiceNumber(invoice);
  }
}
