import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import AuthController from './controllers/v1-auth.controller';
import AuthService from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import DatabaseModule from '../database/database.module';
import MailModule from '../mail/mail.module';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MailModule,
    MinioModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '400y' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard],
  exports: [RolesGuard, JwtAuthGuard, AuthService],
})
export default class AuthModule {}
