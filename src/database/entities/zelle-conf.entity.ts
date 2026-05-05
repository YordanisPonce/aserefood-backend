import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'zelle_conf' })
export default class ZelleConf {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  phoneNumber: string;

  @Column()
  qr: string;
}