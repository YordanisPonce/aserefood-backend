import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Order from './order.entity';

@Entity({ name: 'online_payments' })
export default class OnlinePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  cardNumber: string;

  @Column('character varying', { length: 255 })
  expirationDate: string;

  @Column('character varying', { length: 255 })
  cvv: string;

  @Column('character varying', { length: 255 })
  firstName: string;

  @Column('character varying', { length: 255 })
  lastName: string;

  @Column('character varying', { length: 255 })
  email: string;

  @Column('character varying', { length: 255 })
  phoneNumber: string;

  @Column('character varying', { length: 255 })
  address1: string;

  @Column('character varying', { length: 255, nullable: true })
  address2?: string;

  @Column('character varying', { length: 255 })
  country: string;

  @Column('character varying', { length: 255 })
  state: string;

  @Column('character varying', { length: 255 })
  city: string;

  @Column('character varying', { length: 255 })
  postalCode: string;

  @OneToOne(() => Order, order => order.onlinePayment, { onDelete: 'CASCADE' })
  order: Order;
}
