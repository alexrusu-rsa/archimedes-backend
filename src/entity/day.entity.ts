import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Day {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;
}
