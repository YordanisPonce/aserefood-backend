import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import Language from '../../database/entities/language.entity';
import LanguageOutDto from '../dto/out/language.out.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';
import LanguageUpdateInDto from '../dto/in/language.update.in.dto';
import LanguageInDto from '../dto/in/language.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import LanguageSearchInDto from '../dto/in/language.search.in.dto';

@Injectable()
export default class LanguagesService {
  private readonly logger = new Logger(LanguagesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: LanguageSearchInDto,
  ): Promise<PaginatedOutDto<LanguageOutDto>> {
    const queryBuilder =
      this.pgService.languages.createQueryBuilder('language');

    if (dto.search) {
      queryBuilder.where(
        'language.name ILIKE :search OR language.code ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.isActive !== undefined && dto.isActive !== null) {
      queryBuilder.andWhere('language.isActive = :isActive', {
        isActive: dto.isActive,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(`language.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const languageOut = result.map((user) => this.toOutDto(user));

    return {
      data: languageOut,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<LanguageOutDto[]> {
    const languages = await this.pgService.languages.find({
      where: { isActive: true },
    });

    return languages.map((x) => this.toOutDto(x));
  }

  async getById(id: number): Promise<LanguageOutDto> {
    const language = await this.pgService.languages.findOne({
      where: { id },
    });
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return this.toOutDto(language);
  }

  async post(dto: LanguageInDto): Promise<LanguageOutDto> {
    const existingLanguageByCode = await this.pgService.languages.findOne({
      where: { code: dto.code },
    });

    if (existingLanguageByCode) {
      throw new ConflictException(
        `Language with code "${dto.code}" already exists`,
      );
    }

    const newLanguage = this.pgService.languages.create({
      code: dto.code,
      name: dto.name,
      isActive: true,
    });
    await this.pgService.languages.save(newLanguage);

    this.logger.log(`Created new language with ID ${newLanguage.id}`);

    return this.toOutDto(newLanguage);
  }

  async patch(id: number, dto: LanguageUpdateInDto): Promise<void> {
    if (dto.code) {
      const language = await this.pgService.languages.findOne({
        where: { code: dto.code },
      });

      if (language && language.id !== id) {
        throw new ConflictException(
          `Language with code "${dto.code}" already exists`,
        );
      }
    }

    const language = await this.pgService.languages.findOne({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }

    let patchDto = createPatchFields(dto);

    await this.pgService.languages.update(id, patchDto);
    this.logger.log(`Updated category with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  private toOutDto(language: Language): LanguageOutDto {
    const dto = new LanguageOutDto();
    dto.id = language.id;
    dto.name = language.name;
    dto.code = language.code;
    dto.isActive = language.isActive;

    return dto;
  }
}