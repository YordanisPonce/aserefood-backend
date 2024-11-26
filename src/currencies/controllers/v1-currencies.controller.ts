import {
  Body,
  Controller,
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
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import LanguageOutDto from '../../languages/dto/out/language.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import CurrenciesService from '../services/currencies.service';
import CurrencyOutDto from '../dto/out/currency.out.dto';
import CurrencySearchInDto from '../dto/in/currency.search.in.dto';
import CurrencyInDto from '../dto/in/currency.in.dto';
import CurrencyUpdateInDto from '../dto/in/currency.update.in.dto';

@Controller('v1/currencies')
@ApiTags('currencies')
@UseInterceptors(CacheInterceptor)
export default class V1CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<CurrencyOutDto> })
  @ApiOperation({
    summary: 'Get Currencies with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: CurrencySearchInDto,
  ): Promise<PaginatedOutDto<CurrencyOutDto>> {
    return this.currenciesService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [CurrencyOutDto] })
  @ApiOperation({ summary: 'Get all Currencies' })
  async getAll() {
    return this.currenciesService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: CurrencyOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Currency by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.currenciesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: LanguageOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description:
      'Conflict (Other currency with Code or Base Currency already exists)',
  })
  @ApiOperation({ summary: 'Create a new Currency if does not exist' })
  async post(@Body() dto: CurrencyInDto) {
    return this.currenciesService.post(dto);
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
    description:
      'Conflict (Other currency with Code or Base Currency already exists)',
  })
  @ApiOperation({ summary: 'Update a Currency by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CurrencyUpdateInDto,
  ) {
    return this.currenciesService.patch(id, dto);
  }
}