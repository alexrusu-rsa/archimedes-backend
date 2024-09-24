import { Project } from 'src/entity/project.entity';
import { User } from 'src/entity/user.entity';

export interface ActivityFilter {
  date?: Date;
  project?: Project;
  user?: User;
  activeMonth?: Date;
}
