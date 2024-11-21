import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1LanguagesController from './controllers/v1-languages.controller';
import LanguagesService from './services/languages.service';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
  ],
  controllers: [V1LanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService]
})
export class LanguagesModule {}
