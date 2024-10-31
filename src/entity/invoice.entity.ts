import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lastSavedInvoiceNumber: string;
}
