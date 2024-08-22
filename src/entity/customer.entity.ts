import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name: string;

  @Column()
  CUI: string;

  @Column()
  Reg: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  directorName: string;

  @Column({ nullable: true })
  directorTel: string;

  @Column({ nullable: true })
  directorEmail: string;

  @Column({ nullable: true })
  internal: boolean;

  @Column({ nullable: true })
  VAT: boolean;

  @Column({ nullable: true })
  IBANRO: string;

  @Column({ nullable: true })
  IBANEUR: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  romanianCompany: boolean;

  @Column({ nullable: true })
  swift: string;
}
