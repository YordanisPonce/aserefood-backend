import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import AvailabilityService from '../services/availability.service';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { ProductAvailableByMunicipalityOutDto } from '../dto/out/availability/product-available-by-municipality.out..dto';
import ProductAvailabilitySearchInDto from '../dto/in/availability/product-availability.search.in.dto';
import { ProductComboAvailableByMunicipalityOutDto } from '../dto/out/availability/product-combo-available-by-municipality.out.dto';
import ProductComboAvailabilitySearchInDto from '../dto/in/availability/product-combo-availability.search.in.dto';

@Controller('v1/availability')
@ApiTags('availability')
export class V1AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('/products')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductAvailableByMunicipalityOutDto>,
  })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseInterceptors(CacheInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({
    summary:
      'Get available products by municipality of current customer with Pagination, Ordering and Filtering. Only for Costumers',
  })
  async getAvailableProducts(
    @Query() dto: ProductAvailabilitySearchInDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.availabilityService.getAvailableProductsByMunicipality(
      userId,
      dto,
    );
  }

  @Get('/product/:id')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: ProductAvailableByMunicipalityOutDto,
  })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseInterceptors(CacheInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({
    summary:
      'Get available product by id of current customer. Only for Costumers',
  })
  async getAvailableProductById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.availabilityService.getAvailableProductByIdCustomer(id, userId);
  }

  @Get('/products/:municipalityId')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductAvailableByMunicipalityOutDto>,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get available products by municipality with Pagination, Ordering and Filtering.',
  })
  async getAvailableProductsByMunicipality(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Query() dto: ProductAvailabilitySearchInDto,
  ) {
    return this.availabilityService.getAvailableProductsByMunicipalityId(
      municipalityId,
      dto,
    );
  }

  @Get('/products/:municipalityId/:id')
  @ApiOkResponse({
    description: 'Ok',
    type: ProductAvailableByMunicipalityOutDto,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary: 'Get available product by municipality and id.',
  })
  async getAvailableProductByMunicipalityId(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.availabilityService.getAvailableProductById(
      id,
      municipalityId,
    );
  }

  @Get('/product-combos')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>,
  })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseInterceptors(CacheInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({
    summary:
      'Get available product combos by municipality of current customer with Pagination, Ordering and Filtering. Only for Costumers',
  })
  async getAvailableProductCombos(
    @Query() dto: ProductComboAvailabilitySearchInDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.availabilityService.getAvailableProductCombosByMunicipality(
      userId,
      dto,
    );
  }

  @Get('/product-combo/:id')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: ProductComboAvailableByMunicipalityOutDto,
  })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseInterceptors(CacheInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({
    summary:
      'Get available product combo by municipality of current customer. Only for Costumers',
  })
  async getAvailableProductComboById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.availabilityService.getAvailableProductComboByMunicipalityCustomer(
      id,
      userId,
    );
  }

  @Get('/product-combos/:municipalityId')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get available product combos by municipality with Pagination, Ordering and Filtering.',
  })
  async getAvailableProductCombosByMunicipalityId(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Query() dto: ProductComboAvailabilitySearchInDto,
  ) {
    return this.availabilityService.getAvailableProductCombosByMunicipalityId(
      municipalityId,
      dto,
    );
  }

  @Get('/product-combos/:municipalityId/:id')
  @ApiOkResponse({
    description: 'Ok',
    type: ProductComboAvailableByMunicipalityOutDto,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get available product combo by municipality.',
  })
  async getAvailableProductComboByMunicipalityId(
    @Param('id', ParseIntPipe) id: number,
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
  ) {
    return this.availabilityService.getAvailableProductComboByMunicipality(
      id,
      municipalityId,
    );
  }
}
