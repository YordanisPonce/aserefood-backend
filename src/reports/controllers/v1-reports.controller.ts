import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import ReportsService from '../services/reports.service';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import UserOutDto from '../../users/dto/out/user.out.dto';
import UserSearchInDto from '../../users/dto/in/user.search.in.dto';
import MostDemandedItemOutDto from '../dto/out/most-demanded-item.out.dto';
import MostDemandedItemInDto from '../dto/in/most-demanded-item.in.dto';
import SaleOutDto from '../dto/out/sale.out.dto';

@Controller('v1/reports')
@ApiTags('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@UseInterceptors(CacheInterceptor)
export default class V1ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/mostDemandedProducts')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: [MostDemandedItemOutDto]})
  @ApiOperation({
    summary: 'Get Most Demanded products',
  })
  async products(
    @Query() dto: MostDemandedItemInDto,
  ): Promise<MostDemandedItemOutDto[]> {
    return this.reportsService.mostDemandedProducts(dto.startDate, dto.endDate, dto.quantity);
  }

  @Get('/mostDemandedProductCombos')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: [MostDemandedItemOutDto]})
  @ApiOperation({
    summary: 'Get Most Demanded product combos',
  })
  async productCombos(
    @Query() dto: MostDemandedItemInDto,
  ): Promise<MostDemandedItemOutDto[]> {
    return this.reportsService.mostDemandedProductCombos(dto.startDate, dto.endDate, dto.quantity);
  }

  @Get('/sales/day')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: SaleOutDto})
  @ApiOperation({
    summary: 'Get Sales of current day',
  })
  async salesDay(): Promise<SaleOutDto> {
    return this.reportsService.salesCurrentDay();
  }

  @Get('/sales/week')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: SaleOutDto})
  @ApiOperation({
    summary: 'Get Sales of current week',
  })
  async salesWeek(): Promise<SaleOutDto> {
    return this.reportsService.salesCurrentWeek();
  }

  @Get('/sales/month')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: SaleOutDto})
  @ApiOperation({
    summary: 'Get Sales of current month',
  })
  async salesMonth(): Promise<SaleOutDto> {
    return this.reportsService.salesCurrentMonth();
  }

  @Get('/sales/year')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: SaleOutDto})
  @ApiOperation({
    summary: 'Get Sales of current year',
  })
  async salesYear(): Promise<SaleOutDto> {
    return this.reportsService.salesCurrentYear();
  }
}