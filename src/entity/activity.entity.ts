import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  end: string;

  @Column({ nullable: true })
  projectId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  extras?: string;
}
