import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  projectName: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  contract: string;
}
