import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import PgService from './services/pg.service';
import RefreshToken from './entities/refresh-token.entity';
import Municipality from './entities/municipality.entity';
import Zone from './entities/zone.entity';
import Province from './entities/province.entity';
import Provider from './entities/provider.entity';
import Category from './entities/category.entity';
import Product from './entities/product.entity';
import ConfirmationToken from './entities/confirmation-token.entity';
import { InventoryEntry } from './entities/inventory-entry.entity';
import ProductCombo from './entities/product-combo.entity';
import ProductComboItem from './entities/product-combo-item.entity';
import { DeliveryMethod } from './entities/delivery-method.entity';
import Promotion from './entities/promotion.entity';
import Currency from './entities/currency.entity';
import Language from './entities/language.entity';
import ContactInfo from './entities/contact-info.entity';
import CartProduct from './entities/cart-product.entity';
import OnlinePayment from './entities/online-payment.entity';
import TransferPayment from './entities/transfer-payment.entity';
import Order from './entities/order.entity';
import OrderItems from './entities/order-item.entity';
import ZelleConf from './entities/zelle-conf.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        charset: 'utf8mb4',
        synchronize: true,
        entities: [
          User,
          RefreshToken,
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
          DeliveryMethod,
          Promotion,
          Currency,
          Language,
          ContactInfo,
          CartProduct,
          OnlinePayment,
          TransferPayment,
          Order,
          OrderItems,
          ZelleConf
        ],
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
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
      DeliveryMethod,
      Promotion,
      Currency,
      Language,
      ContactInfo,
      CartProduct,
      OnlinePayment,
      TransferPayment,
      Order,
      OrderItems,
      ZelleConf
    ]),
  ],
  exports: [PgService],
  providers: [PgService],
})
export default class DatabaseModule {}
