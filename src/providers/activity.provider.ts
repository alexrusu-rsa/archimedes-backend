import { Provider } from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { Connection } from 'typeorm';

export const ActivityProvider: Provider[] = [
  {
    provide: 'ACTIVITY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Activity),
    inject: ['DATABASE_CONNECTION'],
  },
];
