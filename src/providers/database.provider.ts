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
        host:
          process.env.DATABASE_HOST ||
          'ec2-52-209-185-5.eu-west-1.compute.amazonaws.com',
        port: (process.env.DATABASE_PORT as unknown as number) || 5432,
        username: process.env.DATABASE_USERNAME || 'qbvauuepktekxu',
        password:
          process.env.DATABASE_P ||
          'f5d2d2108578782838d46cc0bef0b61adba2607b5ab4e7bff8ca0ea378be4d80',
        database: process.env.DATABASE_NAME || 'd56tk5ode151l3',
        entities: [Activity, User, Customer, Project],
        ssl: { rejectUnauthorized: false },
        synchronize: false,
      }),
  },
];
