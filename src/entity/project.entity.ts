import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  projectName: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  contract: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  invoiceTerm: number;

  @Column({ nullable: true })
  contractSignDate: Date;

  customer?: Customer;
}
