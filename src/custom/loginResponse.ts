import { User } from 'src/entity/user.entity';

export class LoginResponse {
  access_token: string;
  role: string;
  userId: string;

  constructor(acces_token: string, role: string, id: string) {
    this.access_token = acces_token;
    this.role = role;
    this.userId = id;
  }
}
