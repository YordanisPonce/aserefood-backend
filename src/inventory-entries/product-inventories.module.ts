import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1InventoryEntriesController from './controllers/v1-inventory-entries.controller';
import InventoryEntriesService from './services/inventory-entries.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1InventoryEntriesController],
  providers: [InventoryEntriesService],
  exports: [InventoryEntriesService],
})
export class InventoryEntriesModule {}
