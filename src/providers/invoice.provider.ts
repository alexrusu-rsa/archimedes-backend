import { Provider } from '@nestjs/common';
import { Invoice } from 'src/entity/invoice.entity';
import { Connection } from 'typeorm';

export const InvoiceProvider: Provider[] = [
  {
    provide: 'INVOICE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Invoice),
    inject: ['DATABASE_CONNECTION'],
  },
];
