import { Provider } from '@nestjs/common';
import { Rate } from 'src/entity/rate.entity';
import { Connection } from 'typeorm';

export const RateProvider: Provider[] = [
  {
    provide: 'RATE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Rate),
    inject: ['DATABASE_CONNECTION'],
  },
];
