import { Controller, Get, Param, ParseIntPipe, Request, UseGuards, UseInterceptors } from '@nestjs/common';
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
import OnlinePaymentsService from '../services/online-payments.service';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import OnlinePaymentOutDto from '../dto/out/online-payment.out.dto';

@Controller('v1/payments/online')
@ApiTags('payments')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
export default class V1OnlinePaymentsController {
  constructor(
    private readonly onlineService: OnlinePaymentsService,
  ) {}

  @Get('/order/:orderId')
  @Roles(Role.Admin, Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: OnlinePaymentOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Online Payment by the orders id' })
  async getByOrderId(@Param('orderId', ParseIntPipe) orderId: number, @Request() req) {
    return this.onlineService.getPaymentByOrderId(orderId, req.user.userId);
  }

  @Get('/:id')
  @Roles(Role.Admin, Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: OnlinePaymentOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Online Payment by its id' })
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.onlineService.getPaymentById(id, req.user.userId);
  }
}