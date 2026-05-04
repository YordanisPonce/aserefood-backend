import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';
import V1ProductsController from './controllers/v1-products.controller';
import ProductsService from './services/products.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [DatabaseModule, AuthModule, MinioModule],
  controllers: [V1ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductModule {}
