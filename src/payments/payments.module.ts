import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import MailModule from '../mail/mail.module';
import V1OnlinePaymentsController from './controllers/v1-online-payments.controller';
import V1TransferPaymentsController from './controllers/v1-transfer-payments.controller';
import OnlinePaymentsService from './services/online-payments.service';
import TransferPaymentsService from './services/transfer-payments.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [AuthModule, DatabaseModule, MailModule, MinioModule],
  controllers: [V1OnlinePaymentsController, V1TransferPaymentsController],
  providers: [OnlinePaymentsService, TransferPaymentsService],
})
export class PaymentsModule {}
