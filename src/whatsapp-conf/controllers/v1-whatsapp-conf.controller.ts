import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import WhatsAppConfOutDto from '../dto/out/whatsapp-conf.out.dto';
import WhatsAppConfService from '../services/whatsapp-conf.service';
import WhatsAppConfInDto from '../dto/in/whatsapp-conf.in.dto';

@Controller('v1/whatsapp-conf')
@ApiTags('whatsapp-conf')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
export default class V1WhatsAppConfController {
  constructor(private readonly whatsappConfService: WhatsAppConfService) {}

  @Get('')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: WhatsAppConfOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOperation({
    summary: 'Get WhatsApp Configuration if exists',
  })
  async get(): Promise<WhatsAppConfOutDto> {
    return this.whatsappConfService.get();
  }

  @Put('')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: WhatsAppConfOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Create or Update WhatsApp Configuration' })
  async put(@Body() dto: WhatsAppConfInDto): Promise<WhatsAppConfOutDto> {
    return this.whatsappConfService.put(dto);
  }
}