import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { DeleteResult, InsertResult, Repository } from 'typeorm';

@Injectable()
export class ActivityService {
  constructor(
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
  ) {}

  async getActivities(): Promise<Activity[]> {
    return this.activityRepository.find();
  }

  async addActivity(activity: Activity): Promise<InsertResult> {
    return this.activityRepository.insert(activity);
  }

  async findOne(id: number): Promise<Activity> {
    return this.activityRepository.findOne(id);
  }

  async updateById(id: number, activity: Activity): Promise<Activity> {
    const activityToUpdate = await this.activityRepository.findOne(id);
    if (activityToUpdate === undefined) throw new NotFoundException();
    await this.activityRepository.update(id, activity);
    return this.activityRepository.findOne(id);
  }

  async deleteActivity(id: number): Promise<DeleteResult> {
    const activityToDelete = await this.findOne(id);
    if (activityToDelete === undefined) throw new NotFoundException();
    return this.activityRepository.delete(id);
  }
}
