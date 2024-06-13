import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ActivityType } from '../custom/activity-type.enum';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  employeeId: string;

  @Column()
  date: string;

  @Column()
  start: string;

  @Column()
  activityType: ActivityType;

  @Column()
  end: string;

  @Column({ nullable: true })
  projectId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  extras?: string;

  @Column({ nullable: true })
  workedTime: string;
  project?: unknown;
}
