import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';
import V1ProvincesController from './controllers/v1-provinces.controller';
import ProvincesService from './services/provinces.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [V1ProvincesController],
  providers: [ProvincesService],
  exports: [ProvincesService],
})
export class ProvincesModule {}
