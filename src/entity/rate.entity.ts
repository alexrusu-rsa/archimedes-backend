import { RateType } from '../custom/rate-type.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Rate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  employeeId: string;

  @Column('varchar', { nullable: true })
  rate: number;

  @Column({ nullable: true })
  rateType: RateType;

  @Column({ nullable: true })
  employeeTimeCommitement: number;
}
