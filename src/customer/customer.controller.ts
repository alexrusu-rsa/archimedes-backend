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
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Customer')
@Controller()
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private pdfInvoiceService: PdfInvoiceService,
    private xlsxInvoiceService: XlsxInvoiceService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Fetch a list with all existing customers',
  })
  getAllCustomers() {
    return this.customerService.getCustomers();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Get invoice PDF',
    description: 'Get invoice based on request params',
  })
  @ApiParam({
    name: 'id',
    description:
      'Unique ID of the customer we want to generate an invoice for.',
  })
  @ApiParam({
    name: 'invoiceNumber',
    description: 'Number of the invoice that is to be generated.',
  })
  @ApiParam({
    name: 'month',
    description: 'Month that the invoice is generated for.',
  })
  @ApiParam({
    name: 'year',
    description: 'The year that the invoice is generated for.',
  })
  @ApiParam({
    name: 'euroExchange',
    description:
      'The exchange price of EUR at the date when invoice is generated.',
  })
  @ApiParam({
    name: 'dateMillis',
    description: 'The date when the invoice is generated in milliseconds.',
  })
  @Get('/invoice/pdf/:id/:invoiceNumber/:month/:year/:euroExchange/:dateMillis')
  async getInvoice(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('invoiceNumber') invoiceNumber: string,
    @Param('month') month: string,
    @Param('year') year: string,
    @Param('euroExchange') euroExchange: number,
    @Param('dateMillis') dateMillis: string,
  ): Promise<any> {
    const buffer = await this.pdfInvoiceService.generatePDF(
      id,
      invoiceNumber,
      month,
      year,
      euroExchange,
      dateMillis,
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
  @Get(
    '/invoice/xlsx/:id/:invoiceNumber/:month/:year/:euroExchange/:dateMillis',
  )
  getCustomerXlsx(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('invoiceNumber') invoiceNumber: string,
    @Param('month') month: string,
    @Param('year') year: string,
    @Param('euroExchange') euroExchange: number,
    @Param('dateMillis') dateMillis: string,
  ) {
    return this.xlsxInvoiceService.getCustomerExcel(
      res,
      id,
      invoiceNumber,
      month,
      year,
      euroExchange,
      dateMillis,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Add a new customer',
    description: 'Add the customer received in the request body.',
  })
  addCustomer(@Body() customer: Customer) {
    return this.customerService.addCustomer(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Delete a customer',
    description:
      'Delete the customer identified with the unique ID received as request parameter.',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Unique identifier of the customer we want to delete.',
  })
  deleteCustomer(@Param('id') customerId: string) {
    return this.customerService.deleteCustomer(customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a certain customer',
    description:
      'Fetch the customer identified with the unique ID specified in the request parameters.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the customer we want to fetch.',
  })
  getCustomer(@Param('id') id: string) {
    return this.customerService.getCustomer(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Update data of customer',
    description:
      'Update the customer identified by the unique ID received in the request parameters with the updated customer received in the request body.',
  })
  @ApiParam({
    name: 'customerToUpdateId',
    description: 'Unique ID of the customer we want to update.',
  })
  @ApiBody({
    type: Customer,
    description: 'Updated customer data as a customer object.',
  })
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
