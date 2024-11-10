import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Category from './category.entity';

@Entity({ name: 'departments' })
export default class Department{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  @Index({unique: true})
  name: string;

  @Column('character varying', {length: 255, nullable: true})
  description?: string

  @Column({ nullable: true })
  image?: string;

  @ManyToMany(() => Category, (category) => category.departments)
  @JoinTable({
    name: 'department_categories',
    joinColumn: {
      name: 'department_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];
}