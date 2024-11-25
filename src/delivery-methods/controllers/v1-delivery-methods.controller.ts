import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import MunicipalitiesService from '../../municipalities/services/municipalities.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import MunicipalityOutDto from '../../municipalities/dto/out/municipality.out.dto';
import MunicipalitySearchInDto from '../../municipalities/dto/in/municipality.search.in.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import MunicipalityInDto from '../../municipalities/dto/in/municipality.in.dto';
import MunicipalityUpdateInDto from '../../municipalities/dto/in/municipality.update.in.dto';
import DeliveryMethodsService from '../services/delivery-methods.service';
import DeliveryMethodOutDto from '../dto/out/delivery-method.out.dto';
import DeliveryMethodSearchInDto from '../dto/in/delivery-method.search.in.dto';
import DeliveryMethodWithMunicipalityOutDto from '../dto/out/delivery-method-with-municipality.out.dto';
import DeliveryMethodInDto from '../dto/in/delivery-method.in.dto';
import DeliveryMethodUpdateInDto from '../dto/in/delivery-method.update.in.dto';

@Controller('v1/delivery-methods')
@ApiTags('delivery-methods')
@UseInterceptors(CacheInterceptor)
export default class V1DeliveryMethodsController{
  constructor(private readonly deliveryMethodsService: DeliveryMethodsService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<DeliveryMethodOutDto> })
  @ApiOperation({
    summary: 'Get Delivery Methods with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: DeliveryMethodSearchInDto,
  ): Promise<PaginatedOutDto<DeliveryMethodOutDto>> {
    return this.deliveryMethodsService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [DeliveryMethodWithMunicipalityOutDto] })
  @ApiOperation({ summary: 'Get all Delivery Methods' })
  async getAll() {
    return this.deliveryMethodsService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: DeliveryMethodWithMunicipalityOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Delivery Method by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryMethodsService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: DeliveryMethodInDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other delivery method with Name)' })
  @ApiOperation({ summary: 'Create a new Delivery Method if does not exist' })
  async post(@Body() dto: DeliveryMethodInDto) {
    return this.deliveryMethodsService.post(dto);
  }

  @Patch('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other delivery method with Name)' })
  @ApiOperation({ summary: 'Update a Delivery Method by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeliveryMethodUpdateInDto,
  ) {
    return this.deliveryMethodsService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Delivery Method by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryMethodsService.delete(id);
  }
}