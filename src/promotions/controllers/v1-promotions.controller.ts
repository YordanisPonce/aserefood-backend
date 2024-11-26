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
import PromotionsService from '../services/promotions.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import PromotionOutDto from '../dto/out/promotion.out.dto';
import PromotionSearchInDto from '../dto/in/promotion.search.in.dto';
import PromotionInDto from '../dto/in/promotion.in.dto';
import PromotionUpdateInDto from '../dto/in/promotion.update.in.dto';

@Controller('v1/promotions')
@ApiTags('promotions')
@UseInterceptors(CacheInterceptor)
export default class V1PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<PromotionOutDto>,
  })
  @ApiOperation({
    summary: 'Get Promotions with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: PromotionSearchInDto,
  ): Promise<PaginatedOutDto<PromotionOutDto>> {
    return this.promotionsService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [PromotionOutDto] })
  @ApiOperation({ summary: 'Get all Promotions' })
  async getAll() {
    return this.promotionsService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: PromotionOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Promotion by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: PromotionOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description: 'Conflict (Other promotions with Name)',
  })
  @ApiOperation({ summary: 'Create a new Promotion if does not exist' })
  async post(@Body() dto: PromotionInDto) {
    return this.promotionsService.post(dto);
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
    description: 'Conflict (Other promotion with Name)',
  })
  @ApiOperation({ summary: 'Update a Promotion by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PromotionUpdateInDto,
  ) {
    return this.promotionsService.patch(id, dto);
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
  @ApiOperation({
    summary: 'Delete PERMANENTLY a Promotion by its id.',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.delete(id);
  }
}