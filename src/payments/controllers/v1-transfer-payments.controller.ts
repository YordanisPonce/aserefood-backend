import { Controller, Get, Param, ParseIntPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse, ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import TransferPaymentsService from '../services/transfer-payments.service';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import TransferPaymentOutDto from '../dto/out/transfer-payment.out.dto';

@Controller('v1/payments/transfer')
@ApiTags('payments')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
export default class V1TransferPaymentsController {
  constructor(
    private readonly transferServices: TransferPaymentsService,
  ) {}

  @Get('/order/:orderId')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: TransferPaymentOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Transfer Payment by the orders id' })
  async getByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.transferServices.getPaymentByOrderId(orderId);
  }

  @Get('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: TransferPaymentOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Transfer Payment by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.transferServices.getPaymentById(id);
  }
}