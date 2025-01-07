import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import DatabaseModule from '../database/database.module';
import V1ZelleConfController from './controllers/v1-zelle-conf.controller';
import ZelleConfService from './services/zelle-conf.service';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [AuthModule, DatabaseModule, MinioModule],
  controllers: [V1ZelleConfController],
  providers: [ZelleConfService],
  exports: [ZelleConfService],
})
export class ZelleConfModule {}