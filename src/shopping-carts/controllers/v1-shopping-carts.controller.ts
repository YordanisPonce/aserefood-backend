import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import ProductCombosService from '../../product-combos/services/product-combos.service';
import ShoppingCartsService from '../services/shopping-carts.service';
import ProductComboOutDto from '../../product-combos/dto/out/product-combo.out.dto';
import AvailableItemsByMunicipalityOutDto from '../dto/out/available-by-municipality.out.dto';

@Controller('v1/shopping-carts')
@ApiTags('shopping-carts')
@UseInterceptors(CacheInterceptor)
export default class V1ShoppingCartsController {
  constructor(private readonly shoppingCartsService: ShoppingCartsService) {}

  @Get('/availability/:id')
  @ApiOkResponse({
    description: 'Ok',
    type: AvailableItemsByMunicipalityOutDto,
  })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary: 'Get available products and product combos by municipality',
  })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.shoppingCartsService.getAvailableProductsByMunicipality(id);
  }
}
