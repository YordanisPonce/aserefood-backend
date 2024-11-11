import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import UserOutDto from '../dto/out/user.out.dto';
import User from '../../database/entities/user.entity';
import UserInDto from '../dto/in/user.in.dto';
import UserUpdateInDto from '../dto/in/user-update.in.dto';
import UserSearchInDto from '../dto/in/user.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly configService: ConfigService,
  ) {}

  public async search(
    dto: UserSearchInDto,
  ): Promise<PaginatedOutDto<UserOutDto>> {
    const queryBuilder = this.pgService.users.createQueryBuilder('user');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'user.username ILIKE :search OR user.email ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.isActive !== undefined && dto.isActive !== null) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: dto.isActive,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(`user.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const usersOut = result.map((user) => this.toOutDto(user));

    return {
      data: usersOut,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  public async getById(id: number): Promise<UserOutDto> {
    const user = await this.pgService.users.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toOutDto(user);
  }

  public async getByUsername(username: string): Promise<UserOutDto> {
    const user = await this.pgService.users.findOne({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return this.toOutDto(user);
  }

  public async post(dto: UserInDto): Promise<UserOutDto> {
    if(dto.username === this.configService.get('SUPER_ADMIN_USERNAME')){
      throw new ConflictException(
        `User with username "${dto.username}" already exists`,
      );
    }
    const existingUser = await this.pgService.users.findOne({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with username "${dto.username}" already exists`,
      );
    }

    const newUser = this.pgService.users.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      name: dto.name,
      isActive: true,
      isConfirmed: true,
      lastnames: '',
      phoneNumber: '',
    });
    await this.pgService.users.save(newUser);

    this.logger.log(`Created new user with ID ${newUser.id}`);
    this.logger.log({ ...dto });
    return this.toOutDto(newUser);
  }

  public async patch(id: number, dto: UserUpdateInDto): Promise<void> {
    if (dto.username) {
      if(dto.username === this.configService.get('SUPER_ADMIN_USERNAME')){
        throw new ConflictException(
          `User with username "${dto.username}" already exists`,
        );
      }

      const user = await this.pgService.users.findOne({
        where: { username: dto.username },
      });

      if (user && user.id !== id) {
        throw new ConflictException(`User with username "${dto.username}" already exists`);
      }
    }

    const user = await this.pgService.users.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let patchDto = {};

    if (dto.username) patchDto = { ...patchDto, username: dto.username };
    if (dto.role) patchDto = { ...patchDto, role: dto.role };
    if (dto.email) patchDto = { ...patchDto, email: dto.email };
    if (dto.name) patchDto = { ...patchDto, name: dto.name };
    if (dto.password) patchDto = { ...patchDto, password: dto.password };
    if (dto.isActive) patchDto = { ...patchDto, isActive: dto.isActive };

    await this.pgService.users.update(id, patchDto);
    this.logger.log(`Updated user with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  public async delete(id: number, username: string): Promise<void> {
    const user = await this.pgService.users.findOne({ where: { username } });
    if (user.id === id) {
      throw new ConflictException(
        `Current User with ID ${id} cannot be deleted`,
      );
    }

    const result = await this.pgService.users.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Deleted user with ID ${id}`);
  }

  private toOutDto(user: User): UserOutDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
