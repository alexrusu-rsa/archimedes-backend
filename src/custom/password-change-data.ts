import { User } from 'src/entity/user.entity';

export interface PasswordChangeData {
  newPassword: string;
  userId: string;
}
