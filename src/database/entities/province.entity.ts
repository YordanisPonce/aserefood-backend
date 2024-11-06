import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Municipality from './municipality.entity';
import Zone from './zone.entity';

@Entity({ name: 'provinces' })
export default class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  @Index({unique: true})
  name: string;

  @OneToMany(() => Municipality, (municipality) => municipality.province)
  municipalities: Municipality[];

  @ManyToMany(() => Zone, (zone) => zone.provinces)
  zones: Zone[]
}