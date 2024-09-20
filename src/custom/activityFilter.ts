import { Project } from 'src/entity/project.entity';

export interface ActivityFilter {
  date?: Date;
  project?: Project;
  activeMonth?: Date;
}
