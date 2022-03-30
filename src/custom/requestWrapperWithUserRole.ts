import { User } from 'src/entity/user.entity';

export class RequestWrapperWithUserRole {
  data?: User;
  userRole?: string;
}
