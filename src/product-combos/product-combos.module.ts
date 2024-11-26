import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ProductCombosController from './controllers/v1-product-combos.controller';
import ProductCombosService from './services/product-combos.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1ProductCombosController],
  providers: [ProductCombosService],
  exports: [ProductCombosService],
})
export class ProductCombosModule {}
