import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import ShoppingCart from './shopping-cart.entity';
import Product from './product.entity';

@Entity({ name: 'shopping_cart_item' })
export default class ShoppingCartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ShoppingCart, shoppingCart => shoppingCart.shoppingCartItems, { onDelete: 'CASCADE' })
  shoppingCart: ShoppingCart;

  @ManyToOne(() => Product, product => product.shoppingCartItems, {onDelete: 'CASCADE'})
  product: Product;

  @Column('int')
  amount: number;
}