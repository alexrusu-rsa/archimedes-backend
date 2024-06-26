import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Project } from 'src/entity/project.entity';
import { Rate } from 'src/entity/rate.entity';
import { User } from 'src/entity/user.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class RateService {
  constructor(
    @Inject('RATE_REPOSITORY')
    private rateRepository: Repository<Rate>,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async getRateForEmployeeId(id: string): Promise<Rate[]> {
    try {
      const foundRate = this.rateRepository.findBy({ employeeId: id });
      if (foundRate) return foundRate;
      throw new HttpException(
        'There are no rates for this employee',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getAllRates(): Promise<Rate[]> {
    try {
      const rates = this.rateRepository.find();
      const ratesWithProjectAndUser = await Promise.all(
        (
          await rates
        ).map(async (rate) => {
          const project = await this.projectRepository.findOneBy({
            id: rate.projectId,
          });
          const user = await this.userRepository.findOneBy({
            id: rate.employeeId,
          });
          const { password, ...userWithoutPassword } = user;
          return { ...rate, project, user: userWithoutPassword };
        }),
      );
      if (ratesWithProjectAndUser) {
        return ratesWithProjectAndUser;
      }
      throw new HttpException(
        'We could not find any rates in the database.',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getRate(id: string): Promise<Rate> {
    try {
      const rate = this.rateRepository.findOneBy({ id: id });
      if (rate) return rate;
      throw new HttpException(
        'We could not find the rate you were looking for.',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async addRate(rate: Rate): Promise<Rate> {
    try {
      const { user, project, ...rateWithoutProjectAndUser } = rate;

      const newRateId = (
        await this.rateRepository.insert(rateWithoutProjectAndUser)
      ).identifiers[0]?.id;
      if (newRateId) {
        const rateWithoutProjectAndUser = await this.rateRepository.findOneBy({
          id: newRateId,
        });
        return { ...rateWithoutProjectAndUser, user, project };
      }
      throw new HttpException(
        'Rate insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteRate(id: string): Promise<DeleteResult> {
    try {
      const rateToDelete = await this.rateRepository.findOneBy({ id });
      if (rateToDelete) {
        const deletionResult = this.rateRepository.delete(id);
        if (deletionResult) return deletionResult;
        throw new HttpException('Rate was not deleted', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Rate could not be found.', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }

  async updateRate(id: string, rate: Rate): Promise<Rate> {
    try {
      const user = await this.userRepository.findOneBy({
        id: rate.employeeId,
      });
      const { password, ...userWithoutPassword } = user;
      const project = await this.projectRepository.findOneBy({
        id: rate.projectId,
      });
      const toUpdateRate = await this.rateRepository.findOneBy({ id });
      if (toUpdateRate) {
        const updatedRate = await this.rateRepository.update(id, rate);
        if (updatedRate) {
          const rateWithoutProjectAndEmployee =
            await this.rateRepository.findOneBy({
              id,
            });
          return {
            ...rateWithoutProjectAndEmployee,
            user: userWithoutPassword,
            project,
          };
        }

        throw new HttpException(
          'We could not update the rate!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The rate you tried to update could not be found!',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }
}
