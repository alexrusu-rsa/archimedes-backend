import { Activity } from 'src/entity/activity.entity';
import { User } from 'src/entity/user.entity';

export interface UserWithActivities {
  user: User;
  activities: Activity[];
}
