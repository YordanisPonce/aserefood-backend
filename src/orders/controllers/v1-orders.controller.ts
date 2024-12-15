import {
  Body,
  Controller, Delete, Get, Param, ParseIntPipe, Patch,
  Post, Query,
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
  ApiNotFoundResponse, ApiOkResponse,
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
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import OrderOutDto from '../dto/out/order.out.dto';
import OrderSearchInDto from '../dto/in/order.search.in.dto';
import OrderUpdateInDto from '../dto/in/order.update.in.dto';

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

  @Get('')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<OrderOutDto>,
  })
  @ApiOperation({
    summary: 'Get Orders with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: OrderSearchInDto,
  ): Promise<PaginatedOutDto<OrderOutDto>> {
    return this.ordersService.search(dto);
  }

  @Get('/me')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: [OrderOutDto] })
  @ApiOperation({ summary: 'Get all Orders of current Customer' })
  async getAllCustomer(@Request() req) {
    const userId = req.user.userId;
    return this.ordersService.getByUserId(userId);
  }

  @Get('/all')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: [OrderOutDto] })
  @ApiOperation({ summary: 'Get all Orders' })
  async getAll() {
    return this.ordersService.getAll();
  }

  @Get('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: OrderOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Order by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getById(id);
  }

  @Post()
  @Roles(Role.Customer)
  @ApiCreatedResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary: 'Create an Order of the current customer. Only for Costumers',
  })
  async post(@Request() req, @Body() dto: OrderInDto) {
    const userId = req.user.userId;
    return this.ordersService.post(userId, dto);
  }

  @Post('/cancel/job')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ description: 'Ok' })
  @ApiOperation({
    summary: 'Auto Cancel Orders Job. ONLY FOR TESTING',
  })
  async syncCancelled() {
    return this.autoCancelledJob.execute();
  }

  @Patch('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({
    description: 'Conflict (Attempting to update status of a Cancelled Order)',
  })
  @ApiOperation({ summary: 'Update an Order by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OrderUpdateInDto,
  ) {
    return this.ordersService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary: 'Delete PERMANENTLY an Order by its id.',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.delete(id);
  }
}
