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
        host: 'cfs632mn9c82a7.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com',
        port: 5432,
        username: 'u43enruu90cntv',
        password:
          'p33d1a4968e7284104d86ca76188f3a1c8e945763d5c78a8657c34511d6e3ae56',
        database: 'daikkgcm9q1s8c',
        entities: [Activity, User, Customer, Project, Rate],
        ssl: { rejectUnauthorized: false },
        synchronize: false,
      }),
  },
];
