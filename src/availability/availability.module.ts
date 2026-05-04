import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import { V1AvailabilityController } from './controllers/v1-availability.controller';
import AvailabilityService from './services/availability.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [AuthModule, DatabaseModule, MinioModule],
  controllers: [V1AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
