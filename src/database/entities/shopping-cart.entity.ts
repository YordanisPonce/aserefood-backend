import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './user.entity';
import ProductComboItem from './product-combo-item.entity';
import ShoppingCartItem from './shopping-cart-item.entity';

@Entity({ name: 'shopping_carts' })
export default class ShoppingCart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.shoppingCart, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => ShoppingCartItem, (shoppingCartItem) => shoppingCartItem.shoppingCart)
  shoppingCartItems: ShoppingCartItem[];
}