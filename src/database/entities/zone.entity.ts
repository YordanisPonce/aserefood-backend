import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Municipality from './municipality.entity';
import { InventoryEntry } from './inventory-entry.entity';
import ProductCombo from './product-combo.entity';

@Entity({ name: 'zones' })
export default class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  @Index({ unique: true })
  name: string;

  @Column('character varying', { length: 255, nullable: true })
  description?: string;

  @OneToMany(() => Municipality, (municipality) => municipality.zone)
  municipalities: Municipality[];

  @OneToMany(() => InventoryEntry, (entry) => entry.zone)
  inventoryEntries: InventoryEntry[];

  @OneToMany(() => ProductCombo, (productCombo) => productCombo.zone)
  productCombos: ProductCombo[];
}