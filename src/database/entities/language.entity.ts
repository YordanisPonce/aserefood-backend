import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'languages' })
export default class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  @Index({ unique: true })
  code: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('boolean')
  isActive: boolean;
}