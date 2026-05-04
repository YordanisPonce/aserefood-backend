import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import CurrencyOutDto from '../dto/out/currency.out.dto';
import Currency from '../../database/entities/currency.entity';
import createPatchFields from '../../utils/dto/patch-fields.util';
import CurrencyUpdateInDto from '../dto/in/currency.update.in.dto';
import CurrencyInDto from '../dto/in/currency.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import CurrencySearchInDto from '../dto/in/currency.search.in.dto';

@Injectable()
export default class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: CurrencySearchInDto,
  ): Promise<PaginatedOutDto<CurrencyOutDto>> {
    const queryBuilder =
      this.pgService.currencies.createQueryBuilder('currency');

    if (dto.search) {
      queryBuilder.where(
        'unaccent(currency.name) ILIKE unaccent(:search) OR unaccent(currency.code) ILIKE unaccent(:search)',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.isActive !== undefined && dto.isActive !== null) {
      queryBuilder.andWhere('currency.isActive = :isActive', {
        isActive: dto.isActive,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(`currency.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const currencyOut = result.map((user) => this.toOutDto(user));

    return {
      data: currencyOut,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<CurrencyOutDto[]> {
    const currencies = await this.pgService.currencies.find({
      where: { isActive: true },
    });

    return currencies.map((x) => this.toOutDto(x));
  }

  async getById(id: number): Promise<CurrencyOutDto> {
    const currency = await this.pgService.currencies.findOne({
      where: { id },
    });
    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }
    return this.toOutDto(currency);
  }

  async post(dto: CurrencyInDto): Promise<CurrencyOutDto> {
    const existingCurrencyByCode = await this.pgService.currencies.findOne({
      where: { code: dto.code },
    });

    if (existingCurrencyByCode) {
      throw new ConflictException(
        `Currency with code "${dto.code}" already exists`,
      );
    }

    if (dto.isBaseCurrency) {
      if (
        await this.pgService.currencies.findOne({
          where: { isBaseCurrency: true },
        })
      ) {
        throw new ConflictException(`Base currency already exists`);
      }
    }

    const newCurrency = this.pgService.currencies.create({
      code: dto.code,
      name: dto.name,
      isActive: true,
      exchangeRate: dto.exchangeRate,
      isBaseCurrency: dto.isBaseCurrency,
    });
    await this.pgService.currencies.save(newCurrency);

    this.logger.log(`Created new currency with ID ${newCurrency.id}`);

    return this.toOutDto(newCurrency);
  }

  async patch(id: number, dto: CurrencyUpdateInDto): Promise<void> {
    if (dto.code) {
      const currency = await this.pgService.currencies.findOne({
        where: { code: dto.code },
      });

      if (currency && currency.id !== id) {
        throw new ConflictException(
          `Currency with code "${dto.code}" already exists`,
        );
      }
    }

    if (dto.isBaseCurrency) {
      const currency = await this.pgService.currencies.findOne({
        where: { isBaseCurrency: true },
      });
      if (currency && currency.id !== id) {
        throw new ConflictException(`Base currency already exists`);
      }
    }

    const currency = await this.pgService.currencies.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }

    let patchDto = createPatchFields(dto);

    await this.pgService.currencies.update(id, patchDto);
    this.logger.log(`Updated currency with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  private toOutDto(currency: Currency): CurrencyOutDto {
    const dto = new CurrencyOutDto();
    dto.id = currency.id;
    dto.name = currency.name;
    dto.code = currency.code;
    dto.isActive = currency.isActive;
    dto.isBaseCurrency = currency.isBaseCurrency;
    dto.exchangeRate = parseFloat(currency.exchangeRate.toString());

    return dto;
  }
}