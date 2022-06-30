import { Provider } from '@nestjs/common';
import { Customer } from 'src/entity/customer.entity';
import { Connection } from 'typeorm';

export const CustomerProvider: Provider[] = [
  {
    provide: 'CUSTOMER_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Customer),
    inject: ['DATABASE_CONNECTION'],
  },
];
