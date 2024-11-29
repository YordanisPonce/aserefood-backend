import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import Municipality from '../../database/entities/municipality.entity';
import MunicipalityOutDto from '../dto/out/municipality.out.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import MunicipalitySearchInDto from '../dto/in/municipality.search.in.dto';
import MunicipalityInDto from '../dto/in/municipality.in.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';
import MunicipalityUpdateInDto from '../dto/in/municipality.update.in.dto';
import { IsNull, Not } from 'typeorm';

@Injectable()
export default class MunicipalitiesService {
  private readonly logger = new Logger(MunicipalitiesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: MunicipalitySearchInDto,
  ): Promise<PaginatedOutDto<MunicipalityOutDto>> {
    const queryBuilder = this.pgService.municipalities
      .createQueryBuilder('municipality')
      .leftJoinAndSelect('municipality.province', 'province');

    // Filtering
    if (dto.search) {
      queryBuilder.where('municipality.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.provinceId) {
      queryBuilder.andWhere('category.province.id = :provinceId', {
        provinceId: dto.provinceId,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`municipality.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const municipalitiesOut = result.map((m) => this.toOutDto(m));

    return {
      data: municipalitiesOut,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<MunicipalityOutDto[]> {
    const municipalities = await this.pgService.municipalities.find({
      relations: ['province'],
    });

    return municipalities.map((x) => this.toOutDto(x));
  }

  async getById(id: number): Promise<MunicipalityOutDto> {
    const municipality = await this.pgService.municipalities.findOne({
      where: { id },
      relations: ['province'],
    });
    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }
    return this.toOutDto(municipality);
  }

  async post(dto: MunicipalityInDto): Promise<MunicipalityOutDto> {
    const existingMunicipalityByName =
      await this.pgService.municipalities.findOne({
        where: { name: dto.name },
      });

    if (existingMunicipalityByName) {
      throw new ConflictException(
        `Municipality with name "${dto.name}" already exists`,
      );
    }

    const province = await this.pgService.provinces.findOne({
      where: { id: dto.provinceId },
    });

    if (!province) {
      throw new NotFoundException(
        `Province with id "${dto.provinceId}" not found`,
      );
    }

    const newMunicipality = this.pgService.municipalities.create({
      name: dto.name,
      provinceId: dto.provinceId,
    });
    await this.pgService.municipalities.save(newMunicipality);

    this.logger.log(`Created new municipality with ID ${newMunicipality.id}`);

    return this.toOutDto(newMunicipality);
  }

  async patch(id: number, dto: MunicipalityUpdateInDto): Promise<void> {
    if (dto.name) {
      const municipality = await this.pgService.municipalities.findOne({
        where: { name: dto.name },
      });

      if (municipality && municipality.id !== id) {
        throw new ConflictException(
          `Municipality with name "${dto.name}" already exists`,
        );
      }
    }

    if (dto.provinceId) {
      const province = await this.pgService.provinces.findOne({
        where: { id: dto.provinceId },
      });

      if (!province) {
        throw new NotFoundException(
          `Province with id "${dto.provinceId}" not found`,
        );
      }
    }

    const municipality = await this.pgService.municipalities.findOne({
      where: { id },
    });

    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }

    const patchDto = createPatchFields(dto);

    await this.pgService.municipalities.update(id, patchDto);
    this.logger.log(`Updated municipality with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const municipalityToDelete = await this.pgService.municipalities.findOne({
      where: { id },
      relations: ['zone', 'contactInfos'],
    });

    if (municipalityToDelete) {
      if (municipalityToDelete.zone) {
        throw new ConflictException(
          `Municipality with ID ${id} has Associated Zone`,
        );
      }
      if (
        municipalityToDelete.contactInfos &&
        municipalityToDelete.contactInfos.length > 0
      ) {
        throw new ConflictException(
          `Municipality with ID ${id} has Associated Contact Infos`,
        );
      }
    }

    const result = await this.pgService.municipalities.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }
    this.logger.log(`Deleted municipality with ID ${id}`);
  }

  async getAvailableMunicipalities(): Promise<MunicipalityOutDto[]> {
    const data = await this.pgService.municipalities.find({
      where: { zone: { id: IsNull() } },
      relations: ['zone', 'province'],
      order: { id: 'ASC' },
    });

    return data.map((x) => this.toOutDto(x));
  }

  private toOutDto(municipality: Municipality): MunicipalityOutDto {
    const dto = new MunicipalityOutDto();
    dto.id = municipality.id;
    dto.name = municipality.name;
    dto.provinceId = municipality.provinceId;
    dto.provinceName = municipality.province?.name ?? '';

    return dto;
  }
}
