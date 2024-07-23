import { DataSource } from 'typeorm';
export const connectionToDB = new DataSource({
  synchronize: false,
  name: 'default',
  type: 'postgres',
  host: 'cfs632mn9c82a7.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com',
  port: 5432,
  username: 'u43enruu90cntv',
  password: 'p33d1a4968e7284104d86ca76188f3a1c8e945763d5c78a8657c34511d6e3ae56',
  database: 'daikkgcm9q1s8c',
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
