import {
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Product from './product.entity';

@Entity({ name: 'providers' })
export default class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @ManyToMany(() => Product, (product) => product.providers)
  products: Product[];
}