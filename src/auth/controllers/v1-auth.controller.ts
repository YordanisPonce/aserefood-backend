import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import AuthService from '../services/auth.service';
import { AuthOutDto } from '../dto/out/auth.out.dto';
import LoginInDto from '../dto/in/login.in.dto';
import { Role, Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import ChangePasswordInDto from '../dto/in/change-password.in.dto';
import RegisterInDto from '../dto/in/register.in.dto';
import RefreshInDto from '../dto/in/refresh.in.dto';
import { ConfigService } from '@nestjs/config';

@Controller('v1/auth')
@ApiTags('auth')
@UseInterceptors(CacheInterceptor)
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiCreatedResponse({ description: 'Login Successful', type: AuthOutDto })
  @ApiForbiddenResponse({ description: 'Invalid Credentials' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Authenticate into System' })
  async login(@Body() body: LoginInDto): Promise<AuthOutDto> {
    const { accessToken, refreshToken } = await this.authService.login(
      body.username,
      body.password,
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  @Post('refresh')
  @ApiCreatedResponse({
    description: 'Refresh Token Successful',
    type: AuthOutDto,
  })
  @ApiForbiddenResponse({ description: 'Invalid Refresh Token' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Refresh Tokens' })
  async refresh(@Body() dto: RefreshInDto): Promise<AuthOutDto> {
    const { newAccessToken, newRefreshToken } = await this.authService.refresh(
      dto.refreshToken,
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  @Post('change-password')
  @Roles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Invalid Credentials' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiCreatedResponse({ description: 'Password changed successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@Body() dto: ChangePasswordInDto, @Request() req) {
    const userId = req.user.userId;
    return this.authService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
