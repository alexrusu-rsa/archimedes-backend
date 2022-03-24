import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
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
import { response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async getUsers(): Promise<User[]> {
    try {
      const foundUsers = this.userRepository.find();
      if (foundUsers) return foundUsers;
      throw new HttpException(
        'We could not find any users!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
  async getUser(userToFindId: string): Promise<User> {
    try {
      const userFound = this.userRepository.findOne(userToFindId);
      if (userFound) return userFound;
      throw new HttpException(
        'We could not find the user!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
  async addUser(user: User): Promise<InsertResult> {
    try {
      const addedUser = this.userRepository.insert(user);
      if (addedUser) return addedUser;
      throw new HttpException(
        'Bad request when trying to add user!',
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      throw err;
    }
  }

  async getUserByEmail(userEmail: string): Promise<User> {
    try {
      const foundUser = await getConnection()
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.email = :useremail', { useremail: userEmail })
        .getOne();
      if (foundUser) return foundUser;
      throw new HttpException(
        'User with this email was not found!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
  async logUserIn(
    email: string,
    password: string,
  ): Promise<HttpException | RequestWrapper> {
    try {
      const userFound = await getConnection()
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.email = :useremail', { useremail: email })
        .getOne();
      if (userFound) {
        const isMatch = await bcrypt.compare(password, userFound.password);
        if (isMatch) {
          return {
            data: true,
            userId: userFound.id,
          };
        } else {
          throw new HttpException(
            'The credentials are not correct!',
            HttpStatus.UNAUTHORIZED,
          );
        }
      } else {
        throw new HttpException(
          'The credentials are not correct!',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (err) {
      throw err;
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
        const newPassword = this.generateNewPassword();
        updatedUser.password = await this.hashPassword(newPassword);
        this.mailService.sendUserConfirmation(updatedUser, newPassword);
        const updatedUserResult = await this.userRepository.update(
          userToUpdate.id,
          updatedUser,
        );
        if (updatedUserResult)
          return this.userRepository.findOne(updatedUser.id);
        throw new HttpException(
          'We did not find updated user!',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'We could not find the user!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async hashPassword(plainTextPassword: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(plainTextPassword, saltOrRounds);
    return hash;
  }
}
