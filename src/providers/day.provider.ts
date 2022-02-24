import { Provider } from '@nestjs/common';
import { Day } from 'src/entity/day.entity';
import { Connection } from 'typeorm';

export const DayProvider: Provider[] = [
  {
    provide: 'DAY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Day),
    inject: ['DATABASE_CONNECTION'],
  },
];
