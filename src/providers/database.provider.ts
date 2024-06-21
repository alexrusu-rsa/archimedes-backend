import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { Rate } from 'src/entity/rate.entity';
import { User } from 'src/entity/user.entity';
import { createConnection } from 'typeorm';

export const databaseProvider = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () =>
      await createConnection({
        type: 'postgres',
        host: 'ec2-52-215-12-242.eu-west-1.compute.amazonaws.com',
        port: 5432,
        username: 'lvqmazddjsuwmt',
        password:
          '3c40d5e2d6827a5a925fbf96e284634b7fb12f96a5e13d4ca2d69b1c20abcbc3',
        database: 'db5amp9i28kj3q',
        entities: [Activity, User, Customer, Project, Rate],
        ssl: { rejectUnauthorized: false },
        synchronize: false,
      }),
  },
];
