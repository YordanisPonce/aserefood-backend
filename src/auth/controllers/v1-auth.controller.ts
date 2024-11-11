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
  ApiBearerAuth, ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
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
import ConfirmAccountInDto from '../dto/in/confirm-account.in.dto';
import ForgotPasswordInDto from '../dto/in/forgot-password.in.dto';
import ResetPasswordInDto from '../dto/in/reset-password.in.dto';
import CustomerOutDto from '../dto/out/customer.out.dto';

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
      body.email,
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

  @Post('confirm-account')
  @ApiCreatedResponse({
    description: 'Confirm Account Successful',
  })
  @ApiForbiddenResponse({ description: 'Invalid Confirmation Token' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Confirm Account' })
  async confirmAccount(@Body() dto: ConfirmAccountInDto): Promise<void> {
    return this.authService.confirmAccount(dto.confirmationToken);
  }

  @Post('forgot-password')
  @ApiCreatedResponse({
    description: 'Sent Reset Password Successful',
  })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Send Reset Password' })
  async forgotPassword(@Body() dto: ForgotPasswordInDto): Promise<void> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiCreatedResponse({
    description: 'Reset Password Successful',
  })
  @ApiForbiddenResponse({ description: 'Invalid Reset Password Token' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Reset Password' })
  async resetPassword(@Body() dto: ResetPasswordInDto): Promise<void> {
    return this.authService.resetPassword(dto);
  }

  @Post('register')
  @ApiCreatedResponse({
    description: 'Register Customer Successful',
    type: CustomerOutDto,
  })
  @ApiConflictResponse({
    description: 'Conflict with Username or Email'
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Register Customer' })
  async register(@Body() dto: RegisterInDto): Promise<CustomerOutDto> {
    return this.authService.register(dto);
  }

  @Post('change-password')
  @Roles(Role.Customer, Role.Admin)
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
