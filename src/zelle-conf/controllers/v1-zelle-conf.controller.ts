import { Body, Controller, Get, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiCreatedResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import ZelleConfOutDto from '../dto/out/zelle-conf.out.dto';
import ZelleConfService from '../services/zelle-conf.service';
import ZelleConfInDto from '../dto/in/zelle-conf.in.dto';

@Controller('v1/zelle-conf')
@ApiTags('zelle-conf')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@UseInterceptors(CacheInterceptor)
export default class V1ZelleConfController {
  constructor(private readonly zelleConfService: ZelleConfService) {}

  @Get('')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: ZelleConfOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOperation({
    summary: 'Get Zelle Configuration if exists',
  })
  async get(): Promise<ZelleConfOutDto> {
    return this.zelleConfService.get();
  }

  @Put('')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: ZelleConfOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Create or Update Zelle Configuration' })
  async post(@Body() dto: ZelleConfInDto) {
    return this.zelleConfService.put(dto);
  }
}