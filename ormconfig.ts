import { DataSource } from 'typeorm';

export const connectionToDB = new DataSource({
  type: 'postgres',
  host: 'ec2-52-209-185-5.eu-west-1.compute.amazonaws.com',
  port: 5432,
  username: 'qbvauuepktekxu',
  password: 'f5d2d2108578782838d46cc0bef0b61adba2607b5ab4e7bff8ca0ea378be4d80',
  database: 'd56tk5ode151l3',
  entities: ['dist/**/*.entity{ .ts,.js}'],
  synchronize: true,
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
  migrationsRun: true,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
