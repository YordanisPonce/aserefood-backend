import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TransferPayment from './transfer-payment.entity';
import OnlinePayment from './online-payment.entity';
import User from './user.entity';
import ContactInfo from './contact-info.entity';
import { OrderStatus } from './constants';
import OrderItems from './order-item.entity';
import { DeliveryMethod } from './delivery-method.entity';

@Entity({ name: 'orders' })
export default class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  transferPaymentId?: number;

  @OneToOne(() => TransferPayment, (transferPayment) => transferPayment.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  transferPayment?: TransferPayment;

  @Column({ nullable: true })
  onlinePaymentId?: number;

  @OneToOne(() => OnlinePayment, (onlinePayment) => onlinePayment.order, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  onlinePayment?: OnlinePayment;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  contactInfoId: number;

  @ManyToOne(() => ContactInfo, (contactInfo) => contactInfo.orders, {
    onDelete: 'CASCADE',
  })
  contactInfo: ContactInfo;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedDate: Date;

  @OneToMany(() => OrderItems, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItems[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalAmount?: number;

  @Column()
  deliveryMethodId: number;

  @ManyToOne(() => DeliveryMethod, (deliveryMethod) => deliveryMethod.orders)
  deliveryMethod: DeliveryMethod;
}
