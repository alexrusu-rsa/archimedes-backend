import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Invoice } from 'src/entity/invoice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('INVOICE_REPOSITORY')
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async getInvoiceNumber(): Promise<Invoice> {
    try {
      const lastInvoice = await this.invoiceRepository.find();
      if (lastInvoice[0]) {
        return lastInvoice[0];
      }
    } catch (err) {
      throw err;
    }
  }

  async updateLastInvoiceNumber(invoice: Invoice): Promise<any> {
    try {
      const lastInvoice = await this.invoiceRepository.find();
      if (lastInvoice) {
        const updatedLastInvoice = await this.invoiceRepository.update(
          lastInvoice[0].id,
          invoice,
        );
        if (updatedLastInvoice) {
          return updatedLastInvoice;
        } else {
          throw new HttpException(
            'We could not update the invoice number!',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'We could not update the invoice number because we did not find any invoice!',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }
}
