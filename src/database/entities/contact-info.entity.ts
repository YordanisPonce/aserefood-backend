import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Province from './province.entity';
import Municipality from './municipality.entity';
import User from './user.entity';
import Order from './order.entity';

@Entity({ name: 'contact_info' })
export default class ContactInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  name: string;

  @Column('character varying', { length: 255 })
  phoneNumber: string;

  @Column('character varying', { length: 255, nullable: true })
  identificationNumber?: string;

  @ManyToOne(() => Municipality, (municipality) => municipality.contactInfos, {onDelete: 'CASCADE'})
  municipality: string;

  @Column('character varying', { length: 255 })
  address: string;

  @Column('text', { nullable: true })
  observations?: string;

  @ManyToOne(() => User, (user) => user.contactInfos, {onDelete: 'CASCADE'})
  user: string;

  @OneToMany(() => Order, (order) => order.contactInfo)
  orders: Order[];
}