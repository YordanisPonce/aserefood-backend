import { Module } from '@nestjs/common';
import DatabaseModule from '../database/database.module';
import AuthModule from '../auth/auth.module';
import V1ProvidersController from './controllers/v1-providers.controller';
import ProvidersService from './services/providers.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [V1ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProviderModule {}
