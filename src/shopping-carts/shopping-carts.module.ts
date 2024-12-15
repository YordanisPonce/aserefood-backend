import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ShoppingCartsController from './controllers/v1-shopping-carts.controller';
import ShoppingCartsService from './services/shopping-carts.service';
import AvailabilityService from './services/availability.service';
import { V1AvailabilityController } from './controllers/v1-availability.controller';
import AutoDeleteShoppingCartsJob from './jobs/auto-delete-shopping-carts.job';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1ShoppingCartsController, V1AvailabilityController],
  providers: [ShoppingCartsService, AvailabilityService, AutoDeleteShoppingCartsJob],
  exports: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
