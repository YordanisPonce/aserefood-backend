import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1MunicipalitiesController from './controllers/v1-municipalities.controller';
import MunicipalitiesService from './services/municipalities.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1MunicipalitiesController],
  providers: [MunicipalitiesService],
  exports: [MunicipalitiesService],
})
export class MunicipalitiesModule {}
