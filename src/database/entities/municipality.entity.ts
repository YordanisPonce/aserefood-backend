import { Column, Entity, Index, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Province from './province.entity';
import Zone from './zone.entity';

@Entity({ name: 'municipalities' })
export default class Municipality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  @Index({unique: true})
  name: string;

  @ManyToOne(() => Province, (province) => province.municipalities, {onDelete: 'CASCADE'})
  province: Province;

  @ManyToMany(() => Zone, (zone) => zone.municipalities)
  zones: Zone[]

}