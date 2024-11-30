import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Zone from './zone.entity';
import ProductComboItem from './product-combo-item.entity';
import Promotion from './promotion.entity';
import CartProduct from './cart-product.entity';

@Entity({ name: 'product_combos' })
export default class ProductCombo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @Column('character varying', { length: 255 })
  shortDescription: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('boolean')
  isActive: boolean;

  @Column()
  zoneId: number;

  @ManyToOne(() => Zone, (zone) => zone.productCombos, { onDelete: 'CASCADE' })
  zone: Zone;

  @OneToMany(
    () => ProductComboItem,
    (productComboItem) => productComboItem.productCombo,
  )
  productComboItems: ProductComboItem[];

  @OneToMany(
    () => CartProduct,
    (shoppingCartItem) => shoppingCartItem.productCombo,
  )
  shoppingCartItems: CartProduct[];

  @ManyToMany(() => Promotion, (promotion) => promotion.productCombos)
  promotions: Promotion[];
}
