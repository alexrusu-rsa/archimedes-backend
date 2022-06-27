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

  @Column()
  customerDirectorName: string;

  @Column()
  customerDirectorTel: string;

  @Column()
  customerDirectorEmail: string;

  @Column({ nullable: true })
  internal: boolean;
}
