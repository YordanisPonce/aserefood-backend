import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ContactInfosController from './controllers/v1-contact-infos.controller';
import ContactInfosService from './services/contact-infos.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
  ],
  controllers: [
    V1ContactInfosController
  ],
  providers: [ContactInfosService],
  exports: [ContactInfosService],
})
export class ContactInfosModule {}
