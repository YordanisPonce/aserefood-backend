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
import CategoriesService from '../../categories/services/categories.service';
import ProvincesService from '../services/provinces.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import CategoryOutDto from '../../categories/dto/out/category.out.dto';
import CategorySearchInDto from '../../categories/dto/in/category.search.in.dto';
import ProvinceOutDto from '../dto/out/province.out.dto';
import ProvinceSearchInDto from '../dto/in/province.search.in.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import CategoryInDto from '../../categories/dto/in/category.in.dto';
import ProvinceInDto from '../dto/in/province.in.dto';
import ProvinceWithMunicipalitiesOutDto from '../dto/out/province-with-municipalities.out.dto';
import CategoryUpdateInDto from '../../categories/dto/in/category.update.in.dto';
import ProvinceUpdateInDto from '../dto/in/province.update.in.dto';

@Controller('v1/provinces')
@ApiTags('provinces')
@UseInterceptors(CacheInterceptor)
export default class V1ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<ProvinceOutDto> })
  @ApiOperation({
    summary: 'Get Provinces with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: ProvinceSearchInDto,
  ): Promise<PaginatedOutDto<ProvinceOutDto>> {
    return this.provincesService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [ProvinceWithMunicipalitiesOutDto] })
  @ApiOperation({ summary: 'Get all Provinces' })
  async getAll() {
    return this.provincesService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: ProvinceWithMunicipalitiesOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Province by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.provincesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: CategoryInDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other province with Name)' })
  @ApiOperation({ summary: 'Create a new Province if does not exist' })
  async post(@Body() dto: ProvinceInDto) {
    return this.provincesService.post(dto);
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
  @ApiConflictResponse({ description: 'Conflict (Other province with Name)' })
  @ApiOperation({ summary: 'Update a Province by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProvinceUpdateInDto,
  ) {
    return this.provincesService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description: 'Conflict (Province with Municipalities Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Province by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.provincesService.delete(id);
  }
}
