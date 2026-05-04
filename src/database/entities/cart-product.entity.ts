import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column()
  userId: number;

  @ManyToOne(() => Product, (product) => product.shoppingCartItems, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  product?: Product;

  @Column({ nullable: true })
  productId?: number;

  @ManyToOne(
    () => ProductCombo,
    (productCombo) => productCombo.shoppingCartItems,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  productCombo?: ProductCombo;

  @Column({ nullable: true })
  productComboId?: number;

  @ManyToOne(
    () => Municipality,
    (municipality) => municipality.shoppingCartItems,
    {
      onDelete: 'CASCADE',
    },
  )
  municipality: Municipality;

  @Column()
  municipalityId: number;

  @Column('int')
  amount: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedDate: Date;
}
