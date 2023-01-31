import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  customerName: string;

  @Column()
  customerCUI: string;

  @Column()
  customerReg: string;

  @Column()
  customerAddress: string;

  @Column()
  customerCity: string;

  @Column({ nullable: true })
  customerCountry: string;

  @Column({ nullable: true })
  customerDirectorName: string;

  @Column({ nullable: true })
  customerDirectorTel: string;

  @Column({ nullable: true })
  customerDirectorEmail: string;

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
}
