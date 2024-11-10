import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './user.entity';

@Entity({ name: 'confirmation_tokens' })
export default class ConfirmationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({unique: true})
  userId: number;

  @OneToOne(() => User, user => user.confirmationToken, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  confirmationToken: string;
}