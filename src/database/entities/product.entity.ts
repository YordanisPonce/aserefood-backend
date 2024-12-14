import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Category from './category.entity';
import Provider from './provider.entity';
import { InventoryEntry } from './inventory-entry.entity';
import ProductComboItem from './product-combo-item.entity';
import Promotion from './promotion.entity';
import OrderItems from './order-item.entity';
import CartProduct from './cart-product.entity';

@Entity({ name: 'products' })
export default class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @Column('character varying', { length: 255 })
  shortDescription: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  description?: string;

  @Column('boolean')
  isService: boolean;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToMany(() => Provider, (provider) => provider.products)
  @JoinTable({
    name: 'product_providers',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'provider_id',
      referencedColumnName: 'id',
    },
  })
  providers: Provider[];

  @OneToMany(() => InventoryEntry, (entry) => entry.product)
  inventoryEntries: InventoryEntry[];

  @OneToMany(
    () => ProductComboItem,
    (productComboItem) => productComboItem.product,
  )
  productComboItems: ProductComboItem[];

  @ManyToMany(() => Promotion, (promotion) => promotion.products)
  promotions: Promotion[];

  @OneToMany(() => CartProduct, (shoppingCartItem) => shoppingCartItem.product)
  shoppingCartItems: CartProduct[];

  @OneToMany(() => OrderItems, (orderItem) => orderItem.product)
  orderItems: OrderItems[];
}