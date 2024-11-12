import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import V1CategoriesController from './controllers/v1-categories.controller';
import CategoriesService from './services/categories.service';
import AuthModule from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [V1CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
