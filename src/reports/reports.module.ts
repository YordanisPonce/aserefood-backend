import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';
import V1ReportsController from './controllers/v1-reports.controller';
import ReportsService from './services/reports.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1ReportsController],
  providers: [ReportsService],
})
export default class ReportsModule {}