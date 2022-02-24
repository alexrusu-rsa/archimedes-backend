import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  date: Date;

  @Column()
  start: string;

  @Column()
  end: string;

  @Column()
  break: number;

  @Column()
  description: string;

  @Column()
  extras: string;
}
