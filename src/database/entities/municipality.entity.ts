import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Province from './province.entity';
import Zone from './zone.entity';
import ContactInfo from './contact-info.entity';
import CartProduct from './cart-product.entity';
import Order from './order.entity';

@Entity({ name: 'municipalities' })
export default class Municipality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @Column()
  provinceId: number;

  @ManyToOne(() => Province, (province) => province.municipalities, {
    onDelete: 'CASCADE',
  })
  province: Province;

  @ManyToOne(() => Zone, (zone) => zone.municipalities, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  zone?: Zone;

  @OneToMany(() => ContactInfo, (contactInfo) => contactInfo.municipality)
  contactInfos: ContactInfo[];

  @OneToMany(() => Order, (order) => order.municipality)
  orders: Order[];

  @OneToMany(
    () => CartProduct,
    (shoppingCartItem) => shoppingCartItem.municipality,
  )
  shoppingCartItems: CartProduct[];
}
