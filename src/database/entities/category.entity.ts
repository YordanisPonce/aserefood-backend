import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToMany(() => Category, (category) => category.parents)
  children: Category[];

  @ManyToMany(() => Category, (category) => category.children, { cascade: true })
  @JoinTable({
    name: 'category_parents',
    joinColumn: {
      name: 'child_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'parent_id',
      referencedColumnName: 'id',
    },
  })
  parents: Category[];
}