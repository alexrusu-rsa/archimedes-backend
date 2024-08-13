import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { Rate } from 'src/entity/rate.entity';
import { User } from 'src/entity/user.entity';
import { createConnection } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProvider = [
  {
    provide: 'DATABASE_CONNECTION',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) =>
      await createConnection({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_P'),
        database: configService.get<string>('DATABASE_DATABASE'),
        entities: [Activity, User, Customer, Project, Rate],
        ssl: { rejectUnauthorized: false },
        synchronize: false,
      }),
  },
];
