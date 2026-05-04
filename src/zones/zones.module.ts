import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ZonesController from './controllers/v1-zones.controller';
import ZonesService from './services/zones.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1ZonesController],
  providers: [ZonesService],
  exports: [ZonesService],
})
export class ZonesModule {}
