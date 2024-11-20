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
import ZonesService from '../services/zones.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import MunicipalityOutDto from '../../municipalities/dto/out/municipality.out.dto';
import MunicipalitySearchInDto from '../../municipalities/dto/in/municipality.search.in.dto';
import ZoneOutDto from '../dto/out/zone.out.dto';
import ZoneSearchInDto from '../dto/in/zone.search.in.dto';
import ZoneWithMunicipalitiesOutDto from '../dto/out/zone-with-municipalities.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import MunicipalityInDto from '../../municipalities/dto/in/municipality.in.dto';
import ZoneInDto from '../dto/in/zone.in.dto';
import MunicipalityUpdateInDto from '../../municipalities/dto/in/municipality.update.in.dto';
import ZoneUpdateInDto from '../dto/in/zone.update.in.dto';

@Controller('v1/zones')
@ApiTags('zones')
@UseInterceptors(CacheInterceptor)
export default class V1ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<ZoneOutDto> })
  @ApiOperation({
    summary: 'Get Zones with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: ZoneSearchInDto,
  ): Promise<PaginatedOutDto<ZoneOutDto>> {
    return this.zonesService.search(dto);
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: ZoneWithMunicipalitiesOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Zone by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.zonesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: ZoneOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other zone with Name)' })
  @ApiOperation({ summary: 'Create a new Zone if does not exist' })
  async post(@Body() dto: ZoneInDto) {
    return this.zonesService.post(dto);
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
  @ApiConflictResponse({ description: 'Conflict (Other zone with Name)' })
  @ApiOperation({ summary: 'Update a Zone by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ZoneUpdateInDto,
  ) {
    return this.zonesService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description: 'Conflict (Zone with Inventory Entries or Product Combos Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Zone by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.zonesService.delete(id);
  }
}