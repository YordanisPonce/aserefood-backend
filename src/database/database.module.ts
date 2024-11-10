import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import PgService from './services/pg.service';
import RefreshToken from './entities/refresh-token.entity';
import Permission from './entities/permission.entity';
import Role from './entities/role.entity';
import Municipality from './entities/municipality.entity';
import Zone from './entities/zone.entity';
import Province from './entities/province.entity';
import Provider from './entities/provider.entity';
import Category from './entities/category.entity';
import Product from './entities/product.entity';
import ConfirmationToken from './entities/confirmation-token.entity';
import { InventoryEntry } from './entities/inventory-entry.entity';
import ProductCombo from './entities/product_combo.entity';
import ProductComboItem from './entities/product-combo-item.entity';
import Department from './entities/department.entity';
import { DeliveryMethod } from './entities/delivery-method.entity';
import Promotion from './entities/promotion.entity';
import Currency from './entities/currency.entity';
import Language from './entities/language.entity';
import ContactInfo from './entities/contact-info.entity';
import ShoppingCart from './entities/shopping-cart.entity';
import ShoppingCartItem from './entities/shopping-cart-item.entity';
import OnlinePayment from './entities/online-payment.entity';
import TransferPayment from './entities/transferPayment.entity';
import Order from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        synchronize: true,
        logging: true,
        entities: [
          User,
          RefreshToken,
          Permission,
          Role,
          Province,
          Municipality,
          Zone,
          Provider,
          Category,
          Product,
          ConfirmationToken,
          InventoryEntry,
          ProductCombo,
          ProductComboItem,
          Department,
          DeliveryMethod,
          Promotion,
          Currency,
          Language,
          ContactInfo,
          ShoppingCart,
          ShoppingCartItem,
          OnlinePayment,
          TransferPayment,
          Order,
        ]
      })
    }),
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      Permission,
      Role,
      Province,
      Municipality,
      Zone,
      Provider,
      Category,
      Product,
      ConfirmationToken,
      InventoryEntry,
      ProductCombo,
      ProductComboItem,
      Department,
      DeliveryMethod,
      Promotion,
      Currency,
      Language,
      ContactInfo,
      ShoppingCart,
      ShoppingCartItem,
      OnlinePayment,
      TransferPayment,
      Order,
    ])
  ],
  exports: [PgService],
  providers: [PgService],
})
export default class DatabaseModule {}
