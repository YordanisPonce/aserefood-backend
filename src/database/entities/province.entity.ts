import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Municipality from './municipality.entity';

@Entity({ name: 'provinces' })
export default class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @OneToMany(() => Municipality, (municipality) => municipality.province)
  municipalities: Municipality[];
}