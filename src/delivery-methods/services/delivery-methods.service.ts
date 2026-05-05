import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import { DeliveryMethod } from '../../database/entities/delivery-method.entity';
import DeliveryMethodOutDto from '../dto/out/delivery-method.out.dto';
import DeliveryMethodWithMunicipalityOutDto from '../dto/out/delivery-method-with-municipality.out.dto';
import DeliveryMethodUpdateInDto from '../dto/in/delivery-method.update.in.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';
import DeliveryMethodInDto from '../dto/in/delivery-method.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import DeliveryMethodSearchInDto from '../dto/in/delivery-method.search.in.dto';

@Injectable()
export default class DeliveryMethodsService {
  private readonly logger = new Logger(DeliveryMethodsService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: DeliveryMethodSearchInDto,
  ): Promise<PaginatedOutDto<DeliveryMethodOutDto>> {
    const queryBuilder = this.pgService.deliveryMethods
      .createQueryBuilder('deliveryMethod')
      .leftJoinAndSelect('deliveryMethod.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'deliveryMethod.name LIKE :search OR deliveryMethod.estimatedArrivalTime LIKE :search OR deliveryMethod.pickUpDirection LIKE :search',
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

    if (dto.isFree !== undefined && dto.isFree !== null) {
      queryBuilder.andWhere('deliveryMethod.isFree = :isFree', {
        isFree: dto.isFree,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`deliveryMethod.${orderBy}`, orderDirection);

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

  async getAll(): Promise<DeliveryMethodWithMunicipalityOutDto[]> {
    const deliveryMethods = await this.pgService.deliveryMethods
      .createQueryBuilder('deliveryMethod')
      .leftJoinAndSelect('deliveryMethod.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .getMany();

    return deliveryMethods.map((deliveryMethod) =>
      this.toOutWithMunicipalitiesDto(deliveryMethod),
    );
  }

  async getById(id: number): Promise<DeliveryMethodWithMunicipalityOutDto> {
    const deliveryMethod = await this.pgService.deliveryMethods
      .createQueryBuilder('deliveryMethod')
      .leftJoinAndSelect('deliveryMethod.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .where('deliveryMethod.id = :id', { id })
      .getOne();

    if (!deliveryMethod) {
      throw new NotFoundException(`Delivery Method with ID ${id} not found`);
    }

    return this.toOutWithMunicipalitiesDto(deliveryMethod);
  }

  async post(dto: DeliveryMethodInDto): Promise<DeliveryMethodOutDto> {
    const existingDeliveryMethodByName =
      await this.pgService.deliveryMethods.findOne({
        where: { name: dto.name },
      });

    if (existingDeliveryMethodByName) {
      throw new ConflictException(
        `Delivery Method with name "${dto.name}" already exists`,
      );
    }

    const municipality = await this.pgService.municipalities.findOne({
      where: { id: dto.municipalityId },
    });

    if (!municipality) {
      throw new BadRequestException(
        `Municipality Associated with ${dto.municipalityId} not found`,
      );
    }

    const newDeliveryMethod = this.pgService.deliveryMethods.create({
      name: dto.name,
      cost: dto.cost,
      municipalityId: dto.municipalityId,
      estimatedArrivalTime: dto.estimatedArrivalTime,
      isFree: dto.isFree,
      minimalDeliveryPrice: dto.minimalDeliveryPrice,
      pickUpDirection: dto.pickUpDirection,
    });
    await this.pgService.deliveryMethods.save(newDeliveryMethod);

    this.logger.log(
      `Created new Delivery Method with ID ${newDeliveryMethod.id}`,
    );

    return this.toOutDto(newDeliveryMethod);
  }

  async patch(id: number, dto: DeliveryMethodUpdateInDto): Promise<void> {
    if (dto.name) {
      const deliveryMethod = await this.pgService.deliveryMethods.findOne({
        where: { name: dto.name },
      });

      if (deliveryMethod && deliveryMethod.id !== id) {
        throw new ConflictException(
          `Delivery Method with name "${dto.name}" already exists`,
        );
      }
    }

    const deliveryMethod = await this.pgService.deliveryMethods.findOne({
      where: { id },
    });

    if (!deliveryMethod) {
      throw new NotFoundException(`Delivery Method with ID ${id} not found`);
    }

    const municipality = await this.pgService.municipalities.findOne({
      where: { id: dto.municipalityId },
    });

    if (!municipality) {
      throw new BadRequestException(
        `Municipality Associated with ${id} not found`,
      );
    }

    const patchDto = createPatchFields(dto);

    await this.pgService.deliveryMethods.update(id, patchDto);
    this.logger.log(`Updated delivery method with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const result = await this.pgService.deliveryMethods.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Delivery Method with ID ${id} not found`);
    }
    this.logger.log(`Deleted Delivery Method with ID ${id}`);
  }

  private toOutDto(deliveryMethod: DeliveryMethod): DeliveryMethodOutDto {
    const dto = new DeliveryMethodOutDto();
    dto.id = deliveryMethod.id;
    dto.name = deliveryMethod.name;
    dto.cost = parseFloat(deliveryMethod.cost.toString());
    dto.municipalityId = deliveryMethod.municipalityId;
    dto.isFree = deliveryMethod.isFree;
    dto.estimatedArrivalTime = deliveryMethod.estimatedArrivalTime;
    dto.minimalDeliveryPrice = parseFloat(
      deliveryMethod.minimalDeliveryPrice.toString(),
    );
    dto.pickUpDirection = deliveryMethod.pickUpDirection;

    return dto;
  }

  private toOutWithMunicipalitiesDto(
    deliveryMethod: DeliveryMethod,
  ): DeliveryMethodWithMunicipalityOutDto {
    const dto = new DeliveryMethodWithMunicipalityOutDto();
    dto.id = deliveryMethod.id;
    dto.name = deliveryMethod.name;
    dto.cost = parseFloat(deliveryMethod.cost.toString());
    dto.isFree = deliveryMethod.isFree;
    dto.estimatedArrivalTime = deliveryMethod.estimatedArrivalTime;
    dto.minimalDeliveryPrice = parseFloat(
      deliveryMethod.minimalDeliveryPrice.toString(),
    );
    dto.pickUpDirection = deliveryMethod.pickUpDirection;
    dto.municipality = {
      id: deliveryMethod.municipality?.id ?? -1,
      name: deliveryMethod.municipality?.name ?? '',
      provinceId: deliveryMethod.municipality?.provinceId ?? -1,
      provinceName: deliveryMethod.municipality?.province?.name ?? '',
    };

    return dto;
  }
}
