import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { User } from 'src/entity/user.entity';
import { getConnection, InsertResult, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUser(userToFindId: string): Promise<User> {
    return this.userRepository.findOne(userToFindId);
  }
  async addUser(user: User): Promise<InsertResult> {
    return this.userRepository.insert(user);
  }
  async logUserIn(username: string, password: string): Promise<RequestWrapper> {
    const userFound = await getConnection()
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.username = :user', { user: username })
      .getOne();
    if (userFound) {
      if (userFound.password === password) {
        return {
          data: true,
          userId: userFound.id,
        };
      }
    } else {
      throw new NotFoundException();
      return {
        data: false,
      };
    }
    return {
      data: false,
    };
  }
}
