import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ActivityType } from '../custom/activity-type.enum';
import { Project } from './project.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  employeeId: string;

  @Column()
  date: Date;

  @Column({ type: 'timestamp' })
  start: Date;

  @Column()
  activityType: ActivityType;

  @Column({ type: 'timestamp' })
  end: Date;

  @Column({ nullable: true })
  projectId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  extras?: string;

  @Column({ nullable: true })
  workedTime: string;
  project?: Project;
}
