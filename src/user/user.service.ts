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

  async create(userData: User) {
    const newUser = await this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async getUser(userId: string): Promise<User> {
    try {
      const userFound = this.userRepository.findOne(userId);
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
  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
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
    console.log(hash);
  }
}
