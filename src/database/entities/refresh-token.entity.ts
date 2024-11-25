import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity({ name: 'refresh_tokens' })
export default class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  refreshToken: string;
}