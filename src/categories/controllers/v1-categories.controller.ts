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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import CategoryOutDto from '../dto/out/category.out.dto';
import CategorySearchInDto from '../dto/in/category.search.in.dto';
import CategoriesService from '../services/categories.service';
import CategoryInDto from '../dto/in/category.in.dto';
import CategoryUpdateInDto from '../dto/in/category.update.in.dto';

@Controller('v1/categories')
@ApiTags('categories')
@UseInterceptors(CacheInterceptor)
export default class V1CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<CategoryOutDto> })
  @ApiOperation({
    summary: 'Get Categories with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: CategorySearchInDto,
  ): Promise<PaginatedOutDto<CategoryOutDto>> {
    return this.categoriesService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [CategoryOutDto] })
  @ApiOperation({ summary: 'Get all Categories' })
  async getAll() {
    return this.categoriesService.getAll();
  }

  @Get('/ancestors/:id')
  @ApiOkResponse({ description: 'Ok', type: [CategoryOutDto] })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get ancestor categories of an specific category' })
  async getAncestors(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getAncestors(id);
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: CategoryOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Category by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: CategoryInDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other category with Name)' })
  @ApiOperation({ summary: 'Create a new Category if does not exist' })
  async post(@Body() dto: CategoryInDto) {
    return this.categoriesService.post(dto);
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
  @ApiConflictResponse({ description: 'Conflict (Other category with Name)' })
  @ApiOperation({ summary: 'Update a Category by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CategoryUpdateInDto,
  ) {
    return this.categoriesService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description: 'Conflict (Category with Products Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Category by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
