import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { User } from 'src/entity/user.entity';
import { MailService } from 'src/mail/mail.service';
import { getConnection, InsertResult, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private mailService: MailService,
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

  async logUserIn(email: string, password: string): Promise<RequestWrapper> {
    const userFound = await getConnection()
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.email = :useremail', { useremail: email })
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

  generateNewPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async resetUserPassword(email: string): Promise<User> {
    const userToUpdate = await getConnection()
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.email = :useremail', { useremail: email })
      .getOne();
    const updatedUser = userToUpdate;
    updatedUser.password = this.generateNewPassword();
    this.mailService.sendUserConfirmation(updatedUser, updatedUser.password);
    await this.userRepository.update(userToUpdate.id, updatedUser);
    return this.userRepository.findOne(updatedUser.id);
  }
}
