import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import ProvinceOutDto from '../../provinces/dto/out/province.out.dto';
import Provider from '../../database/entities/provider.entity';
import ProviderOutDto from '../dto/out/provider.out.dto';
import PgService from '../../database/services/pg.service';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProviderSearchInDto from '../dto/in/provider.search.in.dto';
import ProviderInDto from '../dto/in/provider.in.dto';
import ProviderUpdateInDto from '../dto/in/provider.update.in.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';

@Injectable()
export default class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: ProviderSearchInDto,
  ): Promise<PaginatedOutDto<ProviderOutDto>> {
    const queryBuilder =
      this.pgService.providers.createQueryBuilder('provider');

    // Filtering
    if (dto.search) {
      queryBuilder.where('provider.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`provider.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    return {
      data: result.map((p) => this.toOutDto(p)),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<ProviderOutDto[]> {
    const providers = await this.pgService.providers.find({});

    return providers.map((x) => this.toOutDto(x));
  }

  async getById(id: number): Promise<ProviderOutDto> {
    const provider = await this.pgService.providers.findOne({
      where: { id },
    });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }
    return this.toOutDto(provider);
  }

  async post(dto: ProviderInDto): Promise<ProviderOutDto> {
    const existingProviderByName = await this.pgService.providers.findOne({
      where: { name: dto.name },
    });

    if (existingProviderByName) {
      throw new ConflictException(
        `Provider with name "${dto.name}" already exists`,
      );
    }

    const newProvider = this.pgService.providers.create({
      name: dto.name,
    });
    await this.pgService.providers.save(newProvider);

    this.logger.log(`Created new provider with ID ${newProvider.id}`);

    return this.toOutDto(newProvider);
  }

  async patch(id: number, dto: ProviderUpdateInDto): Promise<void> {
    if (dto.name) {
      const provider = await this.pgService.providers.findOne({
        where: { name: dto.name },
      });

      if (provider && provider.id !== id) {
        throw new ConflictException(
          `Provider with name "${dto.name}" already exists`,
        );
      }
    }
    const provider = await this.pgService.providers.findOne({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    let patchDto = createPatchFields(dto);

    await this.pgService.providers.update(id, patchDto);
    this.logger.log(`Updated provider with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const providersToDelete = await this.pgService.providers.findOne({
      where: { id },
      relations: ['products'],
    });

    if (
      providersToDelete &&
      providersToDelete.products &&
      providersToDelete.products.length > 0
    ) {
      throw new ConflictException(
        `Provider with ID ${id} has Associated Products`,
      );
    }

    const result = await this.pgService.providers.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }
    this.logger.log(`Deleted provider with ID ${id}`);
  }

  private toOutDto(provider: Provider): ProviderOutDto {
    const dto = new ProvinceOutDto();
    dto.id = provider.id;
    dto.name = provider.name;

    return dto;
  }
}
