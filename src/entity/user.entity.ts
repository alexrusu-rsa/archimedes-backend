import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  surname?: string;

  @Column()
  name?: string;

  @Column()
  role?: string;

  @Column()
  seniority?: string;
}
