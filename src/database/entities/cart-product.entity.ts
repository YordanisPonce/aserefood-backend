import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './user.entity';
import Product from './product.entity';

@Entity({ name: 'cart_products' })
export default class CartProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.shoppingCartItems, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Product, (product) => product.shoppingCartItems, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column('int')
  amount: number;
}