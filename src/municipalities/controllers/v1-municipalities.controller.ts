import {
  Body,
  Controller,
  Delete,
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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import MunicipalitiesService from '../services/municipalities.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import MunicipalityOutDto from '../dto/out/municipality.out.dto';
import MunicipalityInDto from '../dto/in/municipality.in.dto';
import MunicipalitySearchInDto from '../dto/in/municipality.search.in.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import MunicipalityUpdateInDto from '../dto/in/municipality.update.in.dto';

@Controller('v1/municipalities')
@ApiTags('municipalities')
@UseInterceptors(CacheInterceptor)
export default class V1MunicipalitiesController {
  constructor(private readonly municipalitiesService: MunicipalitiesService) {}

  @Get('')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<MunicipalityOutDto>,
  })
  @ApiOperation({
    summary: 'Get Municipalities with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: MunicipalitySearchInDto,
  ): Promise<PaginatedOutDto<MunicipalityOutDto>> {
    return this.municipalitiesService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [MunicipalityOutDto] })
  @ApiOperation({ summary: 'Get all Municipalities' })
  async getAll() {
    return this.municipalitiesService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: MunicipalityOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Municipality by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.municipalitiesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: MunicipalityInDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description: 'Conflict (Other municipality with Name)',
  })
  @ApiOperation({ summary: 'Create a new Municipality if does not exist' })
  async post(@Body() dto: MunicipalityInDto) {
    return this.municipalitiesService.post(dto);
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
  @ApiConflictResponse({
    description: 'Conflict (Other municipality with Name)',
  })
  @ApiOperation({ summary: 'Update a Municipality by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MunicipalityUpdateInDto,
  ) {
    return this.municipalitiesService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description:
      'Conflict (Municipality with Zone or Contact Infos Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Municipality by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.municipalitiesService.delete(id);
  }
}