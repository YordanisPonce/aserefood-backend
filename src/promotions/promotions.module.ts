import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1PromotionsController from './controllers/v1-promotions.controller';
import PromotionsService from './services/promotions.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
