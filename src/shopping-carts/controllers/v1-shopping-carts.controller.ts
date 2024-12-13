import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import ShoppingCartsService from '../services/shopping-carts.service';
import AvailabilityService from '../services/availability.service';
import { ProductAvailableByMunicipalityOutDto } from '../dto/out/product-available-by-municipality.out..dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProductAvailabilitySearchInDto from '../dto/in/product-availability.search.in.dto';
import { ProductComboAvailableByMunicipalityOutDto } from '../dto/out/product-combo-available-by-municipality.out.dto';
import ProductComboAvailabilitySearchInDto from '../dto/in/product-combo-availability.search.in.dto';

@Controller('v1/shopping-carts')
@ApiTags('shopping-carts')
@UseInterceptors(CacheInterceptor)
export default class V1ShoppingCartsController {
  constructor(
    private readonly shoppingCartsService: ShoppingCartsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get('/availability/products/:municipalityId')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductAvailableByMunicipalityOutDto>,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get available products by municipality with Pagination, Ordering and Filtering',
  })
  async getAvailableProducts(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Query() dto: ProductAvailabilitySearchInDto,
  ) {
    return this.availabilityService.getAvailableProductsByMunicipality(
      municipalityId,
      dto,
    );
  }

  @Get('/availability/product-combos/:municipalityId')
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get available product combos by municipality with Pagination, Ordering and Filtering',
  })
  async getAvailableProductCombos(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Query() dto: ProductComboAvailabilitySearchInDto,
  ) {
    return this.availabilityService.getAvailableProductCombosByMunicipality(
      municipalityId,
      dto,
    );
  }
}
