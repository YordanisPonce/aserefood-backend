import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
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
import ShoppingCartsService from '../services/shopping-carts.service';
import AvailabilityService from '../services/availability.service';
import { ProductAvailableByMunicipalityOutDto } from '../dto/out/availability/product-available-by-municipality.out..dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProductAvailabilitySearchInDto from '../dto/in/availability/product-availability.search.in.dto';
import { ProductComboAvailableByMunicipalityOutDto } from '../dto/out/availability/product-combo-available-by-municipality.out.dto';
import ProductComboAvailabilitySearchInDto from '../dto/in/availability/product-combo-availability.search.in.dto';
import ShoppingCartOutDto from '../dto/out/shopping-cart/shopping-cart.out.dto';
import AddToCartInDto from '../dto/in/shopping-cart/add-to-cart.in.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';

@Controller('v1/shopping-carts')
@ApiTags('shopping-carts')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
export default class V1ShoppingCartsController {
  constructor(
    private readonly shoppingCartsService: ShoppingCartsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get('')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: ShoppingCartOutDto })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get all products and product combos of current Costumer Shopping Cart. Only for Costumers',
  })
  async getAll(@Request() req) {
    const userId = req.user.userId;
    return this.shoppingCartsService.getAllShoppingCart(userId);
  }

  @Post('')
  @Roles(Role.Customer)
  @ApiCreatedResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Add or Update a Product or Product Combo to Cart if possible. Only for Costumers',
  })
  async addToCart(@Request() req, @Body() dto: AddToCartInDto) {
    const userId = req.user.userId;
    return this.shoppingCartsService.addToCart(userId, dto);
  }

  @Get('/availability/products')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductAvailableByMunicipalityOutDto>,
  })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
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

  @Get('/availability/product-combos')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>,
  })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiNotFoundResponse({ description: 'Not Found Municipality' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
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

  @Put('/municipality/:municipalityId')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
  })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Update Municipality for Current Customer. If there are existing Cart Items, they will be processed in the new location. Only for Costumers',
  })
  async init(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.shoppingCartsService.initMunicipality(userId, municipalityId);
  }

  @Delete('/all')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
  })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Delete all Cart Items of the current customer. Only for Costumers',
  })
  async deleteAll(@Request() req) {
    const userId = req.user.userId;
    return this.shoppingCartsService.deleteAll(userId, true);
  }

  @Delete('/:id')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
  })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Delete an specific Cart Item of the current customer. Only for Costumers',
  })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.shoppingCartsService.delete(userId, id, true);
  }
}
