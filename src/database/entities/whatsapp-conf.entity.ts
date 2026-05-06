import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'whatsapp_conf' })
export default class WhatsappConf {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  phoneNumber: string;
}