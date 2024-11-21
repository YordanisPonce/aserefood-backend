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
  ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import ZonesService from '../../zones/services/zones.service';
import InventoryEntriesService from '../services/inventory-entries.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ZoneOutDto from '../../zones/dto/out/zone.out.dto';
import ZoneSearchInDto from '../../zones/dto/in/zone.search.in.dto';
import InventoryEntryOutDto from '../dto/out/inventory-entry.out.dto';
import InventoryEntrySearchInDto from '../dto/in/inventory-entry.search.in.dto';
import ZoneWithMunicipalitiesOutDto from '../../zones/dto/out/zone-with-municipalities.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import ZoneInDto from '../../zones/dto/in/zone.in.dto';
import InventoryEntryInDto from '../dto/in/inventory-entry.in.dto';
import ZoneUpdateInDto from '../../zones/dto/in/zone.update.in.dto';
import InventoryEntryUpdateInDto from '../dto/in/inventory-entry.update.in.dto';

@Controller('v1/inventory-entries')
@ApiTags('inventory-entries')
@UseInterceptors(CacheInterceptor)
export default class V1InventoryEntriesController {
  constructor(private readonly inventoryEntriesService: InventoryEntriesService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<InventoryEntryOutDto> })
  @ApiOperation({
    summary: 'Get Inventory Entries with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: InventoryEntrySearchInDto,
  ): Promise<PaginatedOutDto<InventoryEntryOutDto>> {
    return this.inventoryEntriesService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [InventoryEntryOutDto] })
  @ApiOperation({ summary: 'Get all Inventory Entries' })
  async getAll() {
    return this.inventoryEntriesService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: InventoryEntryOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get an Inventory Entry by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryEntriesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: [InventoryEntryOutDto] })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBody({
    type: [InventoryEntryInDto],
    description: 'Array of Inventory Entry data (BULK)',
  })
  @ApiOperation({ summary: 'Create in bulk new Inventory Entries if does not exist. If exists, update its quantity and price' })
  async post(@Body() dto: InventoryEntryInDto[]) {
    return this.inventoryEntriesService.post(dto);
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
  @ApiOperation({ summary: 'Update a Inventory Entry by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InventoryEntryUpdateInDto,
  ) {
    return this.inventoryEntriesService.patch(id, dto);
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
  @ApiOperation({ summary: 'Delete PERMANENTLY a Inventory Entry by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryEntriesService.delete(id);
  }
}