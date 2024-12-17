import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import ContactInfosService from '../services/contact-infos.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ContactInfoOutDto from '../dto/out/contact-info.out.dto';
import ContactInfoSearchInDto from '../dto/in/contact-info.search.in.dto';
import ContactInfoInDto from '../dto/in/contact-info.in.dto';
import ContactInfoUpdateInDto from '../dto/in/contact-info.update.in.dto';
import ContactInfoWithMunicipalityOutDto from '../dto/out/contact-info-with-municipality.out.dto';

@Controller('v1/contact-infos')
@ApiTags('contact-infos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@UseInterceptors(CacheInterceptor)
export default class V1ContactInfosController {
  constructor(private readonly contactInfosService: ContactInfosService) {}

  @Get('')
  @Roles(Role.Customer)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ContactInfoWithMunicipalityOutDto>,
  })
  @ApiOperation({
    summary:
      'Get Contact Infos of the current customer with Filtering, Ordering and Pagination. Only for Customers',
  })
  async get(
    @Query() dto: ContactInfoSearchInDto,
    @Request() req,
  ): Promise<PaginatedOutDto<ContactInfoWithMunicipalityOutDto>> {
    return this.contactInfosService.search(dto, req.user.userId);
  }

  @Get('/search/backoffice/:userId')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Ok',
    type: PaginatedOutDto<ContactInfoWithMunicipalityOutDto>,
  })
  @ApiOperation({
    summary:
      'Get Contact Infos of the given customer with Filtering, Ordering and Pagination. Only for Admins',
  })
  async getBackOffice(
    @Query() dto: ContactInfoSearchInDto,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<PaginatedOutDto<ContactInfoWithMunicipalityOutDto>> {
    return this.contactInfosService.search(dto, userId);
  }

  @Get('/backoffice/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Ok',
    type: ContactInfoWithMunicipalityOutDto,
  })
  @ApiOperation({
    summary:
      'Get an specific Contact Info. Only for Admins',
  })
  async getBackOfficeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContactInfoWithMunicipalityOutDto> {
    return this.contactInfosService.getById(id);
  }

  @Get('/all')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: [ContactInfoOutDto] })
  @ApiOperation({
    summary: 'Get all Contact Infos of current customer. Only for Customers',
  })
  async getAll(@Request() req) {
    return this.contactInfosService.getAll(req.user.userId);
  }

  @Get('/all/backoffice/:userId')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: [ContactInfoWithMunicipalityOutDto] })
  @ApiOperation({
    summary: 'Get all Contact Infos of given customer. Only for Admins',
  })
  async getAllBackoffice(@Param('userId', ParseIntPipe) userId: number) {
    return this.contactInfosService.getAll(userId);
  }

  @Get('/:id')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok', type: ContactInfoOutDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get a Contact Info by its id. Only for Customers' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.contactInfosService.getById(id);
  }

  @Post('')
  @Roles(Role.Customer)
  @ApiCreatedResponse({ description: 'Ok', type: ContactInfoOutDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({
    description: 'Conflict (Other contact info with Name)',
  })
  @ApiOperation({
    summary:
      'Create a new Contact Info if does not exist for current user. Only for Customers',
  })
  async post(@Body() dto: ContactInfoInDto, @Request() req) {
    return this.contactInfosService.post(req.user.userId, dto);
  }

  @Patch('/:id')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({
    description: 'Conflict (Other contact info with Name)',
  })
  @ApiOperation({
    summary: 'Update a Contact Info by its id. Only for Customers',
  })
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ContactInfoUpdateInDto,
  ) {
    return this.contactInfosService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Customer)
  @ApiOkResponse({ description: 'Ok' })
  @ApiConflictResponse({
    description:
      "Conflict (Current user's contact Info cannot be deleted.  Contact Info with Pending Orders)",
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({
    summary: 'Delete PERMANENTLY a Contact Info by its id. Only for Customers',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.contactInfosService.delete(id);
  }
}