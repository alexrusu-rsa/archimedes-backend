import { DataSource } from 'typeorm';
export const connectionToDB = new DataSource({
  synchronize: false,
  name: 'default',
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT as unknown as number,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_P,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'custom_migrations_history',
  migrationsRun: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
