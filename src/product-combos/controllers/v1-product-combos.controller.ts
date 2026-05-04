import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query, UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse, ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import ProductCombosService from '../services/product-combos.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import ProductComboSearchInDto from '../dto/in/product-combo.search.in.dto';
import ProductComboOutDto from '../dto/out/product-combo.out.dto';
import ProductComboInDto from '../dto/in/product-combo.in.dto';
import ProductComboUpdateInDto from '../dto/in/product-combo.update.in.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileValidationPipe } from '../../utils/pipes/image-file-validation.pipe';

@Controller('v1/product-combos')
@ApiTags('product-combos')
@UseInterceptors(CacheInterceptor)
export default class V1ProductCombosController {
  constructor(private readonly productCombosService: ProductCombosService) {}

  @Get('')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductComboOutDto>,
  })
  @ApiOperation({
    summary: 'Get Product Combos with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: ProductComboSearchInDto,
  ): Promise<PaginatedOutDto<ProductComboOutDto>> {
    return this.productCombosService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [ProductComboOutDto] })
  @ApiOperation({ summary: 'Get all Product Combos' })
  async getAll() {
    return this.productCombosService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: ProductComboOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Product Combo by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productCombosService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: ProductComboOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description: 'Conflict (Other product combo with Name)',
  })
  @ApiOperation({ summary: 'Create a new Product Combo if does not exist' })
  async post(@Body() dto: ProductComboInDto, @UploadedFile(new ImageFileValidationPipe()) image: Express.Multer.File) {
    dto.image = image;
    return this.productCombosService.post(dto);
  }

  @Patch('/:id')
  @Roles(Role.Admin)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description: 'Conflict (Other product combo with Name)',
  })
  @ApiOperation({ summary: 'Update a Product Combo by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProductComboUpdateInDto,
    @UploadedFile(new ImageFileValidationPipe()) image: Express.Multer.File
  ) {
    dto.image = image;
    return this.productCombosService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description: 'Conflict (Product Combo with Promotions Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({
    summary:
      'Delete PERMANENTLY a Product Combo by its id. Just for maintenance. Update isActive in Patch.',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productCombosService.delete(id);
  }
}
