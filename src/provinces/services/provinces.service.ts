import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProvinceSearchInDto from '../dto/in/province.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProvinceOutDto from '../dto/out/province.out.dto';
import ProvinceWithMunicipalitiesOutDto from '../dto/out/province-with-municipalities.out.dto';
import ProvinceInDto from '../dto/in/province.in.dto';
import ProvinceUpdateInDto from '../dto/in/province.update.in.dto';
import Province from '../../database/entities/province.entity';
import createPatchFields from '../../utils/dto/patch-fields.util';

@Injectable()
export default class ProvincesService {
  private readonly logger = new Logger(ProvincesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: ProvinceSearchInDto,
  ): Promise<PaginatedOutDto<ProvinceOutDto>> {
    const queryBuilder =
      this.pgService.provinces.createQueryBuilder('province');

    // Filtering
    if (dto.search) {
      queryBuilder.where('province.name LIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`province.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const provincesOut = result.map((p) => this.toOutDto(p));

    return {
      data: provincesOut,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<ProvinceWithMunicipalitiesOutDto[]> {
    const provinces = await this.pgService.provinces.find({
      relations: ['municipalities'],
    });

    return provinces.map((x) => this.toOutWithMunicipalitiesDto(x));
  }

  async getById(id: number): Promise<ProvinceWithMunicipalitiesOutDto> {
    const province = await this.pgService.provinces.findOne({
      where: { id },
      relations: ['municipalities'],
    });
    if (!province) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }
    return this.toOutWithMunicipalitiesDto(province);
  }

  async post(dto: ProvinceInDto): Promise<ProvinceOutDto> {
    const existingProvinceByName = await this.pgService.provinces.findOne({
      where: { name: dto.name },
    });

    if (existingProvinceByName) {
      throw new ConflictException(
        `Province with name "${dto.name}" already exists`,
      );
    }

    const newProvince = this.pgService.provinces.create({
      name: dto.name,
    });
    await this.pgService.provinces.save(newProvince);

    this.logger.log(`Created new province with ID ${newProvince.id}`);

    return this.toOutDto(newProvince);
  }

  async patch(id: number, dto: ProvinceUpdateInDto): Promise<void> {
    if (dto.name) {
      const province = await this.pgService.provinces.findOne({
        where: { name: dto.name },
      });

      if (province && province.id !== id) {
        throw new ConflictException(
          `Province with name "${dto.name}" already exists`,
        );
      }
    }

    const province = await this.pgService.provinces.findOne({
      where: { id },
    });

    if (!province) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }

    let patchDto = createPatchFields(dto);

    await this.pgService.provinces.update(id, patchDto);
    this.logger.log(`Updated province with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const provinceToDelete = await this.pgService.provinces.findOne({
      where: { id },
      relations: ['municipalities'],
    });

    if (
      provinceToDelete &&
      provinceToDelete.municipalities &&
      provinceToDelete.municipalities.length > 0
    ) {
      throw new ConflictException(
        `Province with ID ${id} has Associated Municipalities`,
      );
    }

    const result = await this.pgService.provinces.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }
    this.logger.log(`Deleted province with ID ${id}`);
  }

  private toOutDto(province: Province): ProvinceOutDto {
    const dto = new ProvinceOutDto();
    dto.id = province.id;
    dto.name = province.name;

    return dto;
  }

  private toOutWithMunicipalitiesDto(
    province: Province,
  ): ProvinceWithMunicipalitiesOutDto {
    const dto = new ProvinceWithMunicipalitiesOutDto();
    dto.id = province.id;
    dto.name = province.name;
    dto.municipalities = province.municipalities.map((x) => ({
      id: x.id,
      name: x.name,
    }));

    return dto;
  }
}
