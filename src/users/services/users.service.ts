import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import UserOutDto from '../dto/out/user.out.dto';
import User from '../../database/entities/user.entity';
import UserInDto from '../dto/in/user.in.dto';
import UserUpdateInDto from '../dto/in/user.update.in.dto';
import UserSearchInDto from '../dto/in/user.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import MailService from '../../mail/services/mail.service';
import { JwtService } from '@nestjs/jwt';
import { OrderStatus } from '../../database/entities/constants';
import MinioService from '../../minio/services/minio.service';
import UserUpdateInternalInDto from '../dto/in/user.update.internal.in.dto';

@Injectable()
export default class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly pgService: PgService,
    private readonly mailService: MailService,
    private readonly minioService: MinioService,
  ) {}

  public async search(
    dto: UserSearchInDto,
  ): Promise<PaginatedOutDto<UserOutDto>> {
    const queryBuilder = this.pgService.users.createQueryBuilder('user');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'user.username LIKE :search OR user.email LIKE :search OR user.lastnames LIKE :search OR user.name LIKE :search',
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

    if (dto.role !== undefined && dto.role !== null) {
      queryBuilder.andWhere('user.role = :role', {
        role: dto.role,
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

    const data: UserOutDto[] = []
    for (const item of result) {
      data.push(await this.toOutDto(item));
    }

    return {
      data: data,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  public async getAll(): Promise<UserOutDto[]> {
    const users = await this.pgService.users.find({});

    const data: UserOutDto[] = []
    for (const user of users) {
      data.push(await this.toOutDto(user));
    }

    return data;
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

  public async getByEmail(email: string): Promise<UserOutDto> {
    const user = await this.pgService.users.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.toOutDto(user);
  }

  public async post(dto: UserInDto): Promise<UserOutDto> {
    const existingUserByUsername = await this.pgService.users.findOne({
      where: { username: dto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException(
        `User with username "${dto.username}" already exists`,
      );
    }

    const existingUserByEmail = await this.pgService.users.findOne({
      where: { email: dto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException(
        `User with email "${dto.email}" already exists`,
      );
    }

    let image = null;
    if(dto.image){
      image = await this.minioService.uploadFile(
        undefined,
        dto.image.buffer,
        dto.image.originalname.split('.').pop(),
        dto.image.mimetype,
      );
    }

    const newUser = this.pgService.users.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      name: dto.name,
      isActive: true,
      isConfirmed: false,
      lastnames: dto.lastnames,
      phoneNumber: dto.phoneNumber,
      image: image,
    });
    await this.pgService.users.save(newUser);

    this.logger.log(`Created new user with ID ${newUser.id}`);

    const confirmationToken = this.jwtService.sign(
      { sub: newUser.id },
      { expiresIn: '300d' },
    );

    const newCt = this.pgService.confirmationTokens.create({
      userId: newUser.id,
      confirmationToken,
    });

    await this.pgService.confirmationTokens.save(newCt);
    this.logger.log(`Created new confirmation token for User ${newUser.id}`);

    await this.mailService.sendConfirmAccountEmail(
      newUser.email,
      newUser.username,
      confirmationToken,
    );

    return this.toOutDto(newUser);
  }

  public async patch(id: number, dto: UserUpdateInDto): Promise<void> {
    if (dto.username) {
      const user = await this.pgService.users.findOne({
        where: { username: dto.username },
      });

      if (user && user.id !== id) {
        throw new ConflictException(
          `User with username "${dto.username}" already exists`,
        );
      }
    }

    if (dto.email) {
      const user = await this.pgService.users.findOne({
        where: { email: dto.email },
      });

      if (user && user.id !== id) {
        throw new ConflictException(
          `User with email "${dto.email}" already exists`,
        );
      }
    }

    const user = await this.pgService.users.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let image = undefined;
    if (dto.image) {
      image = await this.minioService.uploadFile(
        user.image ?? undefined,
        dto.image.buffer,
        undefined,
        dto.image.mimetype,
      );
    }

    const patchDtoInternal: Partial<UserUpdateInternalInDto> = {
      ...(dto.email && { email: dto.email }),
      ...(dto.username && { username: dto.username }),
      ...(image && { image: image }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.isConfirmed !== undefined && { isConfirmed: dto.isConfirmed }),
      ...(dto.name && { name: dto.name }),
      ...(dto.role && { role: dto.role }),
      ...(dto.phoneNumber && { phoneNumber: dto.phoneNumber }),
      ...(dto.lastnames && { lastnames: dto.lastnames }),
    };

    await this.pgService.users.update(id, patchDtoInternal);
    this.logger.log(`Updated user with ID ${id}`);
    this.logger.log({ ...patchDtoInternal });
  }

  public async delete(id: number, username: string): Promise<void> {
    const user = await this.pgService.users.findOne({ where: { username } });
    if (user.id === id) {
      throw new ConflictException(
        `Current User with ID ${id} cannot be deleted`,
      );
    }

    const userToDelete = await this.pgService.users.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (
      userToDelete &&
      userToDelete.orders &&
      userToDelete.orders.some(
        (x) =>
          x.status === OrderStatus.PAYMENT_PENDING ||
          x.status === OrderStatus.PROCESSING_PAYMENT,
      )
    ) {
      throw new ConflictException(`User with ID ${id} has Pending Orders`);
    }

    const result = await this.pgService.users.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      await this.minioService.deleteFile(userToDelete?.image);
    } catch (e) {
      this.logger.error(e);
    }

    this.logger.log(`Deleted user with ID ${id}`);
  }

  private async toOutDto(user: User): Promise<UserOutDto> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isConfirmed: user.isConfirmed,
      lastnames: user.lastnames,
      phoneNumber: user.phoneNumber,
      image: user.image ? await this.minioService.getPresignedUrl(user.image) : null,
    };
  }
}
