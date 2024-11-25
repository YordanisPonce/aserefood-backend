import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

  @Column()
  municipalityId: number;

  @ManyToOne(() => Municipality, (municipality) => municipality.contactInfos, {
    onDelete: 'CASCADE',
  })
  municipality: Municipality;

  @Column('character varying', { length: 255 })
  address: string;

  @Column('text', { nullable: true })
  observations?: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.contactInfos, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Order, (order) => order.contactInfo)
  orders: Order[];
}