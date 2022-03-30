import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { User } from 'src/entity/user.entity';
import { createConnection } from 'typeorm';

export const databaseProvider = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () =>
      await createConnection({
        type: 'postgres',
        host: 'ec2-52-209-185-5.eu-west-1.compute.amazonaws.com',
        port: 5432,
        username: 'qbvauuepktekxu',
        password:
          'f5d2d2108578782838d46cc0bef0b61adba2607b5ab4e7bff8ca0ea378be4d80',
        database: 'd56tk5ode151l3',
        entities: [Activity, User, Customer, Project],
        ssl: { rejectUnauthorized: false },
        synchronize: true,
      }),
  },
];
