import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Zone from '../../database/entities/zone.entity';
import ZoneOutDto from '../dto/out/zone.out.dto';
import ZoneWithMunicipalitiesOutDto from '../dto/out/zone-with-municipalities.out.dto';
import PgService from '../../database/services/pg.service';
import ZoneUpdateInDto from '../dto/in/zone.update.in.dto';
import ZoneInDto from '../dto/in/zone.in.dto';
import { In } from 'typeorm';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ZoneSearchInDto from '../dto/in/zone.search.in.dto';

@Injectable()
export default class ZonesService {
  private readonly logger = new Logger(ZonesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(dto: ZoneSearchInDto): Promise<PaginatedOutDto<ZoneOutDto>> {
    const queryBuilder = this.pgService.zones
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'zone.name ILIKE :search OR zone.description ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.provinceId) {
      queryBuilder.andWhere('province.id = :provinceId', {
        provinceId: dto.provinceId,
      });
    }

    if (dto.municipalityId) {
      queryBuilder.andWhere('municipality.id = :municipalityId', {
        municipalityId: dto.municipalityId,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`zone.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    return {
      data: result.map((m) => this.toOutDto(m)),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<ZoneWithMunicipalitiesOutDto[]> {
    const zones = await this.pgService.zones
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .getMany();

    return zones.map((zone) => this.toOutWithMunicipalitiesDto(zone));
  }

  async getById(id: number): Promise<ZoneWithMunicipalitiesOutDto> {
    const zone = await this.pgService.zones
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .where('zone.id = :id', { id })
      .getOne();

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return this.toOutWithMunicipalitiesDto(zone);
  }

  async post(dto: ZoneInDto): Promise<ZoneOutDto> {
    const existingZoneByName = await this.pgService.zones.findOne({
      where: { name: dto.name },
    });

    if (existingZoneByName) {
      throw new ConflictException(
        `Zone with name "${dto.name}" already exists`,
      );
    }

    const municipalities = await this.pgService.municipalities.find({
      where: { id: In(dto.municipalityIds) },
      relations: ['zone'],
    });

    if (
      municipalities.length !== dto.municipalityIds.length ||
      municipalities.filter((x) => x.zone).length !== 0
    ) {
      throw new BadRequestException('Non Valid Associated Municipalities');
    }
    
    const newZone = this.pgService.zones.create({
      name: dto.name,
      description: dto.description,
      municipalities: municipalities,
    });
    await this.pgService.zones.save(newZone);

    this.logger.log(`Created new zone with ID ${newZone.id}`);

    return this.toOutDto(newZone);
  }

  async patch(id: number, dto: ZoneUpdateInDto): Promise<void> {
    if (dto.name) {
      const zone = await this.pgService.zones.findOne({
        where: { name: dto.name },
      });

      if (zone && zone.id !== id) {
        throw new ConflictException(
          `Zone with name "${dto.name}" already exists`,
        );
      }
    }

    const zone = await this.pgService.zones.findOne({
      where: { id },
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    let patchDto = {
      ...(dto.name ? { name: dto.name } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
    };
    await this.pgService.zones.update(id, patchDto);

    const z = await this.pgService.zones.findOne({
      where: { id },
      relations: ['municipalities'],
    });

    if (dto.municipalityIds) {
      const municipalities = await this.pgService.municipalities.find({
        where: { id: In(dto.municipalityIds) },
        relations: ['zone'],
      });

      const municipalitiesIds = z.municipalities.map((x) => x.id);

      if (
        municipalities.length !== dto.municipalityIds.length ||
        municipalities.filter(
          (x) => x.zone && !municipalitiesIds.includes(x.id),
        ).length !== 0
      ) {
        throw new BadRequestException('Non Valid Associated Municipalities');
      }

      z.municipalities = municipalities;
      await this.pgService.zones.save(z);
    }

    this.logger.log(`Updated zone with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const zoneToDelete = await this.pgService.zones.findOne({
      where: { id },
      relations: ['inventoryEntries', 'productCombos'],
    });

    if (zoneToDelete) {
      if (
        zoneToDelete.inventoryEntries &&
        zoneToDelete.inventoryEntries.length > 0
      ) {
        throw new ConflictException(
          `Zone with ID ${id} has Associated Inventory Entries`,
        );
      }
      if (zoneToDelete.productCombos && zoneToDelete.productCombos.length > 0) {
        throw new ConflictException(
          `Zone with ID ${id} has Associated Product Combos`,
        );
      }
    }

    const result = await this.pgService.zones.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }
    this.logger.log(`Deleted Zone with ID ${id}`);
  }

  private toOutDto(zone: Zone): ZoneOutDto {
    const dto = new ZoneWithMunicipalitiesOutDto();
    dto.id = zone.id;
    dto.name = zone.name;
    dto.description = zone.description;

    return dto;
  }

  private toOutWithMunicipalitiesDto(zone: Zone): ZoneWithMunicipalitiesOutDto {
    const dto = new ZoneWithMunicipalitiesOutDto();
    dto.id = zone.id;
    dto.name = zone.name;
    dto.description = zone.description;
    dto.municipalities =
      zone.municipalities?.map((x) => ({
        id: x.id,
        name: x.name,
        provinceId: x.provinceId,
        provinceName: x.province.name,
      })) ?? [];

    return dto;
  }
}
