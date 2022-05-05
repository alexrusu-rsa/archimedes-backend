import { Inject, Injectable } from '@nestjs/common';
import { ActivityService } from 'src/activity/activity.service';
import { Activity } from 'src/entity/activity.entity';
import { Project } from 'src/entity/project.entity';
import { ProjectService } from 'src/project/project.service';
import { getRepository, Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    private activityService: ActivityService,
  ) {}
}
