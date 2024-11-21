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
  ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import ProductsService from '../../products/services/products.service';
import LanguagesService from '../services/languages.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProductOutDto from '../../products/dto/out/product.out.dto';
import ProductSearchInDto from '../../products/dto/in/product.search.in.dto';
import LanguageOutDto from '../dto/out/language.out.dto';
import LanguageSearchInDto from '../dto/in/language.search.in.dto';
import ProductWithProvidersOutDto from '../../products/dto/out/product-with-providers.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import ProductInDto from '../../products/dto/in/product.in.dto';
import LanguageInDto from '../dto/in/language.in.dto';
import ProductUpdateInDto from '../../products/dto/in/product.update.in.dto';
import LanguageUpdateInDto from '../dto/in/language.update.in.dto';

@Controller('v1/languages')
@ApiTags('languages')
@UseInterceptors(CacheInterceptor)
export default class V1LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<LanguageOutDto> })
  @ApiOperation({
    summary: 'Get Languages with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: LanguageSearchInDto,
  ): Promise<PaginatedOutDto<LanguageOutDto>> {
    return this.languagesService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [LanguageOutDto] })
  @ApiOperation({ summary: 'Get all Languages' })
  async getAll() {
    return this.languagesService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: LanguageOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Language by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.languagesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: LanguageOutDto})
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other language with Code)' })
  @ApiOperation({ summary: 'Create a new Language if does not exist' })
  async post(@Body() dto: LanguageInDto) {
    return this.languagesService.post(dto);
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
  @ApiConflictResponse({ description: 'Conflict (Other language with Code)' })
  @ApiOperation({ summary: 'Update a Language by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LanguageUpdateInDto,
  ) {
    return this.languagesService.patch(id, dto);
  }
}