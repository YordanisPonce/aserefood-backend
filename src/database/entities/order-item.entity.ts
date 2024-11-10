import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import ShoppingCart from './shopping-cart.entity';
import Product from './product.entity';
import Order from './order.entity';

@Entity({ name: 'order_items' })
export default class OrderItem{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, product => product.orderItems, {onDelete: 'CASCADE'})
  product: Product;

  @Column('int')
  amount: number;
}