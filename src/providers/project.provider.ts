import { Provider } from '@nestjs/common';
import { Project } from 'src/entity/project.entity';
import { Connection } from 'typeorm';

export const ProjectProvider: Provider[] = [
  {
    provide: 'PROJECT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Project),
    inject: ['DATABASE_CONNECTION'],
  },
];
