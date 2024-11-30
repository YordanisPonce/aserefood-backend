import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './user.entity';
import Product from './product.entity';
import ProductCombo from './product-combo.entity';
import Municipality from './municipality.entity';

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
    nullable: true,
  })
  product?: Product;

  @ManyToOne(
    () => ProductCombo,
    (productCombo) => productCombo.shoppingCartItems,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  productCombo?: ProductCombo;

  @ManyToOne(
    () => Municipality,
    (municipality) => municipality.shoppingCartItems,
    {
      onDelete: 'CASCADE',
    },
  )
  municipality: Municipality;

  @Column('int')
  amount: number;
}
