import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import Role from './role.entity';
import ContactInfo from './contact-info.entity';
import ShoppingCart from './shopping-cart.entity';
import ConfirmationToken from './confirmation-token.entity';
import Order from './order.entity';

@Entity({ name: 'users' })
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  name: string;

  @Column('character varying', {length: 255})
  lastnames: string;

  @Column('character varying', { length: 255 })
  username: string;

  @Column('character varying', { length: 255 })
  @Index({unique: true})
  email: string;

  @Column('character varying', { length: 255 })
  phoneNumber: string;

  @Column('character varying', { length: 255, nullable: true })
  address?: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users, {onDelete: 'CASCADE' })
  role: Role;

  @Column('boolean')
  isActive: boolean;

  @Column('boolean')
  isConfirmed: boolean;

  @OneToMany(() => ContactInfo, (contactInfo) => contactInfo.municipality)
  contactInfos: ContactInfo[];

  @OneToOne(() => ShoppingCart, shoppingCart => shoppingCart.user, { nullable: true, onDelete: 'SET NULL' })
  shoppingCart?: ShoppingCart;

  @OneToOne(() => ConfirmationToken, confirmationToken => confirmationToken.user, { nullable: true, onDelete: 'SET NULL' })
  confirmationToken?: ConfirmationToken;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }
}
