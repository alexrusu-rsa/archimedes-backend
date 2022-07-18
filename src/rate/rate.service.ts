import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Rate } from 'src/entity/rate.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class RateService {
  constructor(
    @Inject('RATE_REPOSITORY')
    private rateRepository: Repository<Rate>,
  ) {}

  async getAllRates(): Promise<Rate[]> {
    try {
      const rates = this.rateRepository.find();
      if (rates) return rates;
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
      const newRateId = (await this.rateRepository.insert(rate)).identifiers[0]
        ?.id;
      if (newRateId)
        return await this.rateRepository.findOneBy({ id: newRateId });
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
      const toUpdateRate = await this.rateRepository.findOneBy({ id });
      if (toUpdateRate) {
        const updatedRate = await this.rateRepository.update(id, rate);
        if (updatedRate) return this.rateRepository.findOneBy({ id });
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
