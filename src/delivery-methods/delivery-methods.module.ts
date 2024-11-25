import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1DeliveryMethodsController from './controllers/v1-delivery-methods.controller';
import DeliveryMethodsService from './services/delivery-methods.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
  ],
  controllers: [
    V1DeliveryMethodsController
  ],
  providers: [
    DeliveryMethodsService
  ],
  exports: [DeliveryMethodsService]
})
export class DeliveryMethodsModule {}
