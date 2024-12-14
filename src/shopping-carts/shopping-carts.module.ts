import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ShoppingCartsController from './controllers/v1-shopping-carts.controller';
import ShoppingCartsService from './services/shopping-carts.service';
import AvailabilityService from './services/availability.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1ShoppingCartsController],
  providers: [ShoppingCartsService, AvailabilityService],
  exports: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
