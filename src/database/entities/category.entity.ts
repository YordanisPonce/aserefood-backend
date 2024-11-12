import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Product from './product.entity';

@Entity({ name: 'categories' })
export default class Category{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  @Index({unique: true})
  name: string;

  @Column('character varying', {length: 255, nullable: true})
  description?: string

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Column({ name: 'parentId', nullable: true })
  parentId?: number;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}