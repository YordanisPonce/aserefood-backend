import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Request, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import UsersService from '../services/users.service';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import UserOutDto from '../dto/out/user.out.dto';
import UserInDto from '../dto/in/user.in.dto';
import UserUpdateInDto from '../dto/in/user-update.in.dto';
import UserSearchInDto from '../dto/in/user.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';

@Controller('v1/users')
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@UseInterceptors(CacheInterceptor)
export default class V1UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @Roles(Role.Admin)
  @ApiOkResponse({ description: 'Ok', type: PaginatedOutDto<UserOutDto> })
  @ApiOperation({ summary: 'Get Users with Filtering, Ordering and Pagination' })
  async get(@Query() dto: UserSearchInDto): Promise<PaginatedOutDto<UserOutDto>> {
    return this.usersService.search(dto);
  }

  @Get('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({description: "Ok", type: UserOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get a User by its id'})
  async getById(@Param('id', ParseIntPipe) id: number){
    return this.usersService.getById(id);
  }

  @Post('')
  @Roles(Role.Admin)
  @ApiCreatedResponse({description: "Ok", type: UserOutDto})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: 'Conflict (Other user with Username or Email)'})
  @ApiOperation({summary: 'Create a new User if does not exist'})
  async post(@Body() dto: UserInDto){
    return this.usersService.post(dto);
  }

  @Patch('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({description: "Ok"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiConflictResponse({description: "Conflict (Other user with Username or Email)"})
  @ApiOperation({summary: 'Update a User by its id'})
  async put(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserUpdateInDto,
  ){
    return this.usersService.patch(id, dto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @ApiOkResponse({description: "Ok"})
  @ApiConflictResponse({description: "Conflict (Current user cannot be deleted)"})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Delete PERMANENTLY a User by its id. For better integrity change isActive in PATCH'})
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req){
    const username = req.user.username;
    return this.usersService.delete(id, username);
  }

  @Post('/me')
  @Roles(Role.Admin, Role.Customer)
  @ApiCreatedResponse({description: "Current user", type: UserOutDto})
  @ApiNotFoundResponse({description: "Not Found"})
  @ApiBadRequestResponse({description: "Bad Request"})
  @ApiOperation({summary: 'Get the current user by username from JWT'})
  async getMe(@Request() req): Promise<UserOutDto> {
    const username = req.user.username;
    return this.usersService.getByUsername(username);
  }
}