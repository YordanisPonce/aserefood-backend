import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import ShoppingCartOutDto from '../dto/out/shopping-cart.out.dto';
import AddToCartInDto from '../dto/in/add-to-cart.in.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import MunicipalityPOutDto from '../../provinces/dto/out/municipality-p.out.dto';
import AutoDeleteShoppingCartsJob from '../jobs/auto-delete-shopping-carts.job';

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
    private readonly autoDeleteShoppingCartsJob: AutoDeleteShoppingCartsJob,
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

  @Get('/municipality')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: MunicipalityPOutDto })
  @ApiNotFoundResponse({ description: 'Not Found User' })
  @ApiConflictResponse({ description: 'Municipality not selected' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary:
      'Get current costumer selected municipality. Only for Costumers',
  })
  async getMunicipality(@Request() req) {
    const userId = req.user.userId;
    return this.shoppingCartsService.getCurrentMunicipality(userId);
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

  @Post('/auto-delete/job')
  @Roles(Role.Admin)
  @ApiCreatedResponse({ description: 'Ok' })
  @ApiOperation({
    summary:
      'Auto Delete Old Carts Job. ONLY FOR TESTING',
  })
  async deleteCartsJob() {
    return this.autoDeleteShoppingCartsJob.execute();
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
