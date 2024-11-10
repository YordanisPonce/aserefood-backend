import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DiscountOption } from './constants';
import Product from './product.entity';
import ProductCombo from './product-combo.entity';
import Provider from './provider.entity';

@Entity({ name: 'promotions' })
export default class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  code: string;

  @Column('character varying', { length: 255 })
  name: string;

  @Column('character varying', { length: 255 })
  description: string;

  @Column({
    type: 'enum',
    enum: DiscountOption,
  })
  discountOption: DiscountOption;

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column({ nullable: true })
  image?: string;

  @Column('boolean')
  isActive: boolean;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToMany(() => Product, (product) => product.promotions)
  @JoinTable({
    name: 'promotion_products',
    joinColumn: {
      name: 'promotion_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  products: Product[];

  @ManyToMany(() => ProductCombo, (productCombo) => productCombo.promotions)
  @JoinTable({
    name: 'promotion_product_combos',
    joinColumn: {
      name: 'promotion_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_combo_id',
      referencedColumnName: 'id',
    },
  })
  productCombos: ProductCombo[];
}
