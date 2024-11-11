import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Order from './order.entity';

@Entity({ name: 'transfer_payments' })
export default class TransferPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255, nullable: true })
  referencePayment?: string;

  @OneToOne(() => Order, order => order.transferPayment, { onDelete: 'CASCADE' })
  order: Order;
}