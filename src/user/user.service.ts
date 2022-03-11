import { MailerService } from '@nestjs-modules/mailer';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const foundUsers = await this.userRepository.find();
      if (foundUsers) return foundUsers;
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'We could not find any users!',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
    }
  }
  async getUser(userToFindId: string): Promise<User> {
    try {
      const userFound = await this.userRepository.findOne(userToFindId);
      if (userFound) return userFound;
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'We could not find the user!',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
    }
  }
  async addUser(user: User): Promise<InsertResult> {
    try {
      const addedUser = await this.userRepository.insert(user);
      if (addedUser) return addedUser;
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad request when trying to add user!',
        },
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      return err;
    }
  }

  async logUserIn(email: string, password: string): Promise<RequestWrapper> {
    try {
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
        } else {
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              error: 'The password you entered is not correct!',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      } else {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found!',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      return err;
    }
  }

  generateNewPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  async resetUserPassword(email: string): Promise<User> {
    try {
      const userToUpdate = await getConnection()
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.email = :useremail', { useremail: email })
        .getOne();
      if (userToUpdate) {
        const updatedUser = userToUpdate;
        updatedUser.password = this.generateNewPassword();
        this.mailService.sendUserConfirmation(
          updatedUser,
          updatedUser.password,
        );
        const updatedUserResult = await this.userRepository.update(
          userToUpdate.id,
          updatedUser,
        );
        if (updatedUserResult)
          return await this.userRepository.findOne(updatedUser.id);
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'We did not find updated user!',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'We could not find the user!',
        },
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      return err;
    }
  }
}
