import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { configSchema } from './utils/schemas/config.schema';
import AuthModule from './auth/auth.module';
import DatabaseModule from './database/database.module';
import UsersModule from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProductCombosModule } from './product-combos/product-combos.module';
import { ProductModule } from './products/product.module';
import { RolesModule } from './roles/roles.module';
import { ZonesModule } from './zones/zones.module';
import { ProvinceModule } from './province/province.module';
import { MunicipalityModule } from './municipality/municipality.module';
import { ProviderModule } from './providers/provider.module';
import MailModule from './mail/mail.module';
import { InventoryEntriesModule } from './inventory-entries/product-inventories.module';
import { DepartmentsModule } from './departments/departments.module';
import { DeliveryMethodsModule } from './delivery-methods/delivery-methods.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { LanguagesModule } from './languages/languages.module';

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
    PermissionsModule,
    ProductCombosModule,
    InventoryEntriesModule,
    ProductModule,
    RolesModule,
    UsersModule,
    ZonesModule,
    ProvinceModule,
    MunicipalityModule,
    ProviderModule,
    MailModule,
    DepartmentsModule,
    DeliveryMethodsModule,
    PromotionsModule,
    CurrenciesModule,
    LanguagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
