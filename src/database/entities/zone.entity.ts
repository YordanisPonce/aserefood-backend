import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Municipality from './municipality.entity';
import { InventoryEntry } from './inventory-entry.entity';
import ProductCombo from './product-combo.entity';

@Entity({ name: 'zones' })
export default class Zone{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {length: 255})
  @Index({unique: true})
  name: string;

  @Column('character varying', {length: 255, nullable: true})
  description?: string

  @ManyToMany(() => Municipality, (municipality) => municipality.zones)
  @JoinTable({
    name: 'zone_municipalities',
    joinColumn: {
      name: 'zone_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'municipality_id',
      referencedColumnName: 'id',
    },
  })
  municipalities: Municipality[];

  @OneToMany(() => InventoryEntry, (entry) => entry.zone)
  inventoryEntries: InventoryEntry[];

  @OneToMany(() => ProductCombo, (productCombo) => productCombo.zone)
  productCombos: ProductCombo[];
}