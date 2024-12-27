import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Product from './product.entity';
import Order from './order.entity';
import ProductCombo from './product-combo.entity';

@Entity({ name: 'order_items' })
export default class OrderItems {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ nullable: true })
  productId: number;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  product?: Product;

  @Column({ nullable: true })
  productComboId: number;

  @ManyToOne(() => ProductCombo, (productCombo) => productCombo.orderItems, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  productCombo?: ProductCombo;

  @Column('int')
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number;
}
