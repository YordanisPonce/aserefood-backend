import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ZelleConfController from './controllers/v1-zelle-conf.controller';
import ZelleConfService from './services/zelle-conf.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1ZelleConfController],
  providers: [ZelleConfService],
  exports: [ZelleConfService],
})
export class ZelleConfModule {}