import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ShoppingCartsController from './controllers/v1-shopping-carts.controller';
import ShoppingCartsService from './services/shopping-carts.service';
import AutoDeleteShoppingCartsJob from './jobs/auto-delete-shopping-carts.job';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [AuthModule, DatabaseModule, AvailabilityModule],
  controllers: [V1ShoppingCartsController],
  providers: [ShoppingCartsService, AutoDeleteShoppingCartsJob],
  exports: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
