import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { Customer } from 'src/entity/customer.entity';
import { CustomerService } from './customer.service';
import * as fs from 'fs';
import { PdfInvoiceService } from 'src/pdf-invoice/pdf-invoice.service';
import { XlsxInvoiceService } from 'src/xlsx-invoice/xlsx-invoice.service';

@Controller()
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private pdfInvoiceService: PdfInvoiceService,
    private xlsxInvoiceService: XlsxInvoiceService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  getAllCustomers() {
    return this.customerService.getCustomers();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('/invoice/pdf/:id/:invoiceNumber/:month/:year')
  async getInvoice(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('invoiceNumber') invoiceNumber: string,
    @Param('month') month: string,
    @Param('year') year: string,
  ): Promise<any> {
    const buffer = await this.pdfInvoiceService.generatePDF(
      id,
      invoiceNumber,
      month,
      year,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('/invoice/xlsx/:id/:invoiceNumber/:month/:year')
  getCustomerXlsx(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('invoiceNumber') invoiceNumber: string,
    @Param('month') month: string,
    @Param('year') year: string,
  ) {
    return this.xlsxInvoiceService.getCustomerExcel(
      res,
      id,
      invoiceNumber,
      month,
      year,
    );
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
  deleteCustomer(@Param('id') customerId: string) {
    return this.customerService.deleteCustomer(customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get(':id')
  getCustomer(@Param('id') id: string) {
    return this.customerService.getCustomer(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
  updateCustomer(
    @Param('id') customerToUpdateId: string,
    @Body() customer: Customer,
  ) {
    return this.customerService.updateCustomerById(
      customerToUpdateId,
      customer,
    );
  }
}
