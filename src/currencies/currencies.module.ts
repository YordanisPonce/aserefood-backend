import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';
import V1CurrenciesController from './controllers/v1-currencies.controller';
import CurrenciesService from './services/currencies.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
  ],
  controllers: [V1CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
