import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { Rate } from 'src/entity/rate.entity';
import { User } from 'src/entity/user.entity';
import { createConnection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Invoice } from 'src/entity/invoice.entity';

export const databaseProvider = [
  {
    provide: 'DATABASE_CONNECTION',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) =>
      await createConnection({
        type: 'postgres',
        host:
          configService.get<string>('DATABASE_HOST') ||
          process.env.DATABASE_HOST,
        port:
          configService.get<number>('DATABASE_PORT') ||
          (process.env.DATABASE_PORT as unknown as number),
        username:
          configService.get<string>('DATABASE_USERNAME') ||
          process.env.DATABASE_USERNAME,
        password:
          configService.get<string>('DATABASE_P') || process.env.DATABASE_P,
        database:
          configService.get<string>('DATABASE_DATABASE') ||
          process.env.DATABASE_NAME,
        entities: [Activity, User, Customer, Project, Rate, Invoice],
        ssl: { rejectUnauthorized: false },
        synchronize: false,
      }),
  },
];
