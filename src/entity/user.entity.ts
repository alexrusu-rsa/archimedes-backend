import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  surname?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  role?: string;

  @Column({ nullable: true })
  seniority?: string;
}
