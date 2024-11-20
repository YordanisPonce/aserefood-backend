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
import ProvincesService from '../../provinces/services/provinces.service';
import ProvidersService from '../services/providers.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProvinceOutDto from '../../provinces/dto/out/province.out.dto';
import ProvinceSearchInDto from '../../provinces/dto/in/province.search.in.dto';
import ProviderOutDto from '../dto/out/provider.out.dto';
import ProviderSearchInDto from '../dto/in/provider.search.in.dto';
import ProvinceWithMunicipalitiesOutDto from '../../provinces/dto/out/province-with-municipalities.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import CategoryInDto from '../../categories/dto/in/category.in.dto';
import ProvinceInDto from '../../provinces/dto/in/province.in.dto';
import ProviderInDto from '../dto/in/provider.in.dto';
import ProvinceUpdateInDto from '../../provinces/dto/in/province.update.in.dto';
import ProviderUpdateInDto from '../dto/in/provider.update.in.dto';

@Controller('v1/providers')
@ApiTags('providers')
@UseInterceptors(CacheInterceptor)
export default class V1ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<ProviderOutDto> })
  @ApiOperation({
    summary: 'Get Providers with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: ProviderSearchInDto,
  ): Promise<PaginatedOutDto<ProviderOutDto>> {
    return this.providersService.search(dto);
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: ProviderOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Provider by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: ProviderInDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other provider with Name)' })
  @ApiOperation({ summary: 'Create a new Provider if does not exist' })
  async post(@Body() dto: ProviderInDto) {
    return this.providersService.post(dto);
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
  @ApiConflictResponse({ description: 'Conflict (Other provider with Name)' })
  @ApiOperation({ summary: 'Update a Provider by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProviderUpdateInDto,
  ) {
    return this.providersService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description: 'Conflict (Provider with Products Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Provider by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.delete(id);
  }
}