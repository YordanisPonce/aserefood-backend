import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Municipality from './municipality.entity';

@Entity({ name: 'delivery_methods' })
export class DeliveryMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column('character varying', { length: 255 })
  estimatedArrivalTime: string;

  @Column('boolean')
  isFree: boolean;

  @Column('character varying', { length: 255, nullable: true })
  pickUpDirection?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  minimalDeliveryPrice: number;

  @Column()
  municipalityId: number;

  @ManyToOne(() => Municipality, (municipality) => municipality.id, {
    onDelete: 'CASCADE',
  })
  municipality: Municipality;
}