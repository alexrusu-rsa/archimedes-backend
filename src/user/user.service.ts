import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RequestWrapper } from 'src/custom/requestwrapper';
import { User } from 'src/entity/user.entity';
import { MailService } from 'src/mail/mail.service';
import { getConnection, Repository } from 'typeorm';

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
      foundUsers.forEach((found) => {
        const { password, ...foundUserNoPass } = found;
        foundUsers[foundUsers.indexOf(found)] = foundUserNoPass;
      });
      if (foundUsers) return foundUsers;
      throw new HttpException(
        'We could not find any users!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
  async getUser(id: string): Promise<User> {
    try {
      const userFound = await this.userRepository.findOneBy({ id });
      const { password, ...userFoundNoPassword } = userFound;
      if (userFound) return userFoundNoPassword;

      throw new HttpException(
        'We could not find the user!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
  async addUser(user: User): Promise<User> {
    try {
      user.password = await this.hashPassword(user.password);
      const newUserId = (await this.userRepository.insert(user)).identifiers[0]
        ?.id;
      if (newUserId) return await this.userRepository.findOne(newUserId);
      throw new HttpException(
        'Bad request when trying to add user!',
        HttpStatus.NOT_ACCEPTABLE,
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
          return this.userRepository.findOneBy({ id: updatedUser.id });
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

  async deleteUserById(id: string) {
    try {
      const userToDelete = await this.userRepository.findOneBy({ id });
      if (userToDelete) {
        const deletionResult = this.userRepository.delete(id);
        if (deletionResult) {
          return deletionResult;
        }
        throw new HttpException(
          'User was not deleted!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException('User could not be found!', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }

  async updateUserById(id: string, user: User): Promise<User> {
    try {
      const toUpdateUser = await this.userRepository.findOneBy({ id });
      if (toUpdateUser) {
        user.password = await this.hashPassword(user.password);
        const updatedUser = await this.userRepository.update(id, user);
        if (updatedUser) return this.userRepository.findOneBy({ id });
        throw new HttpException(
          'We could not update the user!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The user you tried to update could not be found!',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async hashPassword(plainTextPassword: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(plainTextPassword, saltOrRounds);
    return hash;
  }

  async checkRoleOfUser(id: string): Promise<string> {
    try {
      const foundUser = await this.userRepository.findOneBy({ id });
      if (foundUser) return foundUser.roles;
      throw new HttpException(
        'We could not find the user in the database.',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
}
