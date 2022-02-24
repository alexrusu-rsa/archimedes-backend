import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Day } from 'src/entity/day.entity';
import { DeleteResult, InsertResult, Repository } from 'typeorm';

@Injectable()
export class DayService {
  constructor(
    @Inject('DAY_REPOSITORY')
    private dayRepository: Repository<Day>,
  ) {}

  async getDays(): Promise<Day[]> {
    return this.dayRepository.find();
  }

  async addDay(day: Day): Promise<InsertResult> {
    return this.dayRepository.insert(day);
  }

  async findOne(id: number): Promise<Day> {
    return this.dayRepository.findOne(id);
  }

  async updateById(id: number, day: Day): Promise<Day> {
    const dayToUpdate = await this.dayRepository.findOne(id);
    if (dayToUpdate === undefined) throw new NotFoundException();
    await this.dayRepository.update(id, day);
    return this.dayRepository.findOne(id);
  }

  async deleteDay(id: number): Promise<DeleteResult> {
    const dayToDelete = await this.findOne(id);
    if (dayToDelete === undefined) throw new NotFoundException();
    return this.dayRepository.delete(id);
  }
}
