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
import ProductsService from '../services/products.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProductOutDto from '../dto/out/product.out.dto';
import ProductSearchInDto from '../dto/in/product.search.in.dto';
import ProductWithProvidersOutDto from '../dto/out/product-with-providers.out.dto';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import ProductInDto from '../dto/in/product.in.dto';
import ProductUpdateInDto from '../dto/in/product.update.in.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileValidationPipe } from '../../utils/pipes/image-file-validation.pipe';

@Controller('v1/products')
@ApiTags('products')
@UseInterceptors(CacheInterceptor)
export default class V1ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<ProductOutDto> })
  @ApiOperation({
    summary: 'Get Products with Filtering, Ordering and Pagination',
  })
  async get(
    @Query() dto: ProductSearchInDto,
  ): Promise<PaginatedOutDto<ProductOutDto>> {
    return this.productsService.search(dto);
  }

  @Get('/all')
  @ApiOkResponse({ description: 'Ok', type: [ProductWithProvidersOutDto] })
  @ApiOperation({ summary: 'Get all Products' })
  async getAll() {
    return this.productsService.getAll();
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'Ok', type: ProductWithProvidersOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Product by its id' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getById(id);
  }

  @Post('')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ok', type: ProductOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict (Other product with Name)' })
  @ApiOperation({ summary: 'Create a new Product if does not exist' })
  async post(@Body() dto: ProductInDto, @UploadedFile(new ImageFileValidationPipe()) image: Express.Multer.File) {
    dto.image = image;
    return this.productsService.post(dto);
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
  @ApiConflictResponse({ description: 'Conflict (Other product with Name)' })
  @ApiOperation({ summary: 'Update a Product by its id' })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProductUpdateInDto,
    @UploadedFile(new ImageFileValidationPipe()) image: Express.Multer.File
  ) {
    dto.image = image;
    return this.productsService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description:
      'Conflict (Product with Inventory Entries or Product Combo Items or Promotions or Shopping Cart Items or Order Items Associated)',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete PERMANENTLY a Product by its id.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}