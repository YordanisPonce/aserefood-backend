import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import { PaymentsModule } from '../payments/payments.module';
import V1OrdersController from './controllers/v1-orders.controller';
import OrdersService from './services/orders.service';
import { ShoppingCartsModule } from '../shopping-carts/shopping-carts.module';
import MailModule from '../mail/mail.module';
import AutoCancelOrdersJob from './jobs/auto-cancel-orders.job';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    PaymentsModule,
    ShoppingCartsModule,
    MailModule,
  ],
  controllers: [V1OrdersController],
  providers: [OrdersService, AutoCancelOrdersJob],
})
export class OrdersModule {}
