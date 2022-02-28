import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  employeeId: number;

  @Column()
  date: string;

  @Column()
  start: string;

  @Column()
  end: string;

  @Column()
  description: string;

  @Column()
  extras: string;
}
