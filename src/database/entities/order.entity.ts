import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import TransferPayment from './transferPayment.entity';
import OnlinePayment from './online-payment.entity';
import User from './user.entity';
import ContactInfo from './contact-info.entity';
import { OrderStatus } from './constants';
import ShoppingCartItem from './shopping-cart-item.entity';
import OrderItem from './order-item.entity';

@Entity({ name: 'orders' })
export default class Order{
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => TransferPayment, transferPayment => transferPayment.order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  transferPayment?: TransferPayment;

  @OneToOne(() => OnlinePayment, onlinePayment => onlinePayment.order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  onlinePayment?: OnlinePayment;

  @ManyToOne(() => User, (user) => user.orders, {onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ContactInfo, (contactInfo) => contactInfo.orders, {onDelete: 'CASCADE' })
  contactInfo: ContactInfo;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column({ type: 'timestamp' })
  createdDate: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];
}