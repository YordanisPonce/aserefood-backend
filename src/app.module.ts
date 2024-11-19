import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { configSchema } from './utils/schemas/config.schema';
import AuthModule from './auth/auth.module';
import DatabaseModule from './database/database.module';
import UsersModule from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductCombosModule } from './product-combos/product-combos.module';
import { ProductModule } from './products/product.module';
import { ZonesModule } from './zones/zones.module';
import { ProvincesModule } from './provinces/provinces.module';
import { MunicipalitiesModule } from './municipalities/municipalities.module';
import { ProviderModule } from './providers/provider.module';
import MailModule from './mail/mail.module';
import { InventoryEntriesModule } from './inventory-entries/product-inventories.module';
import { DeliveryMethodsModule } from './delivery-methods/delivery-methods.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { LanguagesModule } from './languages/languages.module';
import { ContactInfosModule } from './contact-infos/contact-infos.module';
import { ShoppingCartsModule } from './shopping-carts/shopping-carts.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    AuthModule,
    CategoriesModule,
    DatabaseModule,
    ProductCombosModule,
    InventoryEntriesModule,
    ProductModule,
    UsersModule,
    ZonesModule,
    ProvincesModule,
    MunicipalitiesModule,
    ProviderModule,
    MailModule,
    DeliveryMethodsModule,
    PromotionsModule,
    CurrenciesModule,
    LanguagesModule,
    ContactInfosModule,
    ShoppingCartsModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
