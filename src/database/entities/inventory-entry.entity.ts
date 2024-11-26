import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Product from './product.entity';
import Zone from './zone.entity';

@Entity({ name: 'inventory_entries' })
export class InventoryEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.inventoryEntries, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column()
  zoneId: number;

  @ManyToOne(() => Zone, (zone) => zone.inventoryEntries, {
    onDelete: 'CASCADE',
  })
  zone: Zone;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}