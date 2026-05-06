import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1WhatsAppConfController from './controllers/v1-whatsapp-conf.controller';
import WhatsAppConfService from './services/whatsapp-conf.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [V1WhatsAppConfController],
  providers: [WhatsAppConfService],
  exports: [WhatsAppConfService],
})
export class WhatsAppConfModule {}