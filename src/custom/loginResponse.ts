import { User } from 'src/entity/user.entity';

export class LoginResponse {
  accessToken: string;
  currentUser: User;

  constructor(accessToken: string, currentUser: User) {
    this.accessToken = accessToken;
    this.currentUser = currentUser;
  }
}
