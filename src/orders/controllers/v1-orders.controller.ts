import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import OrdersService from '../services/orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import OrderInDto from '../dto/in/order.in.dto';
import AutoCancelOrdersJob from '../jobs/auto-cancel-orders.job';

@Controller('v1/orders')
@ApiTags('orders')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
export default class V1OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly autoCancelledJob: AutoCancelOrdersJob,
  ) {}

  @Post()
  @Roles(Role.Customer)
  @ApiCreatedResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary: 'Create an Order of the current customer. Only for Costumers',
  })
  async addToCart(@Request() req, @Body() dto: OrderInDto) {
    const userId = req.user.userId;
    return this.ordersService.post(userId, dto);
  }

  @Post('/cancelled/job')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ description: 'Ok' })
  @ApiOperation({
    summary: 'Auto Cancelled Orders Job. ONLY FOR TESTING',
  })
  async syncCancelled() {
    return this.autoCancelledJob.execute();
  }
}
