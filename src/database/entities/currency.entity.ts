import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'currencies' })
export default class Currency{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  @Index({unique: true})
  code: string;

  @Column('character varying', {length: 255})
  name: string;

  @Column('boolean')
  isActive: boolean;

  @Column('boolean')
  isBaseCurrency: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  exchangeRate: number;
}