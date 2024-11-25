import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import Zone from '../../database/entities/zone.entity';
import ZoneOutDto from '../../zones/dto/out/zone.out.dto';
import ZoneWithMunicipalitiesOutDto from '../../zones/dto/out/zone-with-municipalities.out.dto';
import ContactInfo from '../../database/entities/contact-info.entity';
import ContactInfoOutDto from '../dto/out/contact-info.out.dto';
import ContactInfoWithMunicipalityOutDto from '../dto/out/contact-info-with-municipality.out.dto';
import ZoneUpdateInDto from '../../zones/dto/in/zone.update.in.dto';
import { In } from 'typeorm';
import ContactInfoUpdateInDto from '../dto/in/contact-info.update.in.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';
import ZoneInDto from '../../zones/dto/in/zone.in.dto';
import ContactInfoInDto from '../dto/in/contact-info.in.dto';
import ZoneSearchInDto from '../../zones/dto/in/zone.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ContactInfoSearchInDto from '../dto/in/contact-info.search.in.dto';

@Injectable()
export default class ContactInfosService {
  private readonly logger = new Logger(ContactInfosService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: ContactInfoSearchInDto,
    userId: number,
  ): Promise<PaginatedOutDto<ContactInfoOutDto>> {
    const queryBuilder = this.pgService.contactInfos
      .createQueryBuilder('contactInfo')
      .leftJoinAndSelect('contactInfo.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province');

    queryBuilder.where('contactInfo.userId = :userId', {
      userId: userId,
    });

    // Filtering
    if (dto.search) {
      queryBuilder.andWhere(
        'contactInfo.name ILIKE :search OR contactInfo.phoneNumber ILIKE :search OR contactInfo.identificationNumber ILIKE :search  OR contactInfo.address ILIKE :search OR contactInfo.observations ILIKE :search',
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
    queryBuilder.orderBy(`contactInfo.${orderBy}`, orderDirection);

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

  async getAll(userId: number): Promise<ContactInfoWithMunicipalityOutDto[]> {
    const contactInfos = await this.pgService.contactInfos
      .createQueryBuilder('contactInfo')
      .leftJoinAndSelect('contactInfo.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .where('contactInfo.userId = :userId', { userId: userId })
      .getMany();

    return contactInfos.map((ci) => this.toOutWithMunicipalitiesDto(ci));
  }

  async getById(id: number): Promise<ContactInfoWithMunicipalityOutDto> {
    const contactInfo = await this.pgService.contactInfos
      .createQueryBuilder('contactInfo')
      .leftJoinAndSelect('contactInfo.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .where('contactInfo.id = :id', { id })
      .getOne();

    if (!contactInfo) {
      throw new NotFoundException(`Contact Info with ID ${id} not found`);
    }

    return this.toOutWithMunicipalitiesDto(contactInfo);
  }

  async post(
    userId: number,
    dto: ContactInfoInDto,
  ): Promise<ContactInfoOutDto> {
    const existingContactInfoByName = await this.pgService.contactInfos.findOne(
      {
        where: { name: dto.name },
      },
    );

    if (existingContactInfoByName) {
      throw new ConflictException(
        `Contact Info with name "${dto.name}" already exists`,
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

    const user = await this.pgService.users.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException(`User Associated with ${userId} not found`);
    }

    const newContactInfo = this.pgService.contactInfos.create({
      name: dto.name,
      address: dto.address,
      observations: dto.observations,
      identificationNumber: dto.identificationNumber,
      municipalityId: dto.municipalityId,
      userId: userId,
      phoneNumber: dto.phoneNumber,
    });
    await this.pgService.contactInfos.save(newContactInfo);

    this.logger.log(`Created new contact info with ID ${newContactInfo.id}`);

    return this.toOutDto(newContactInfo);
  }

  async patch(id: number, dto: ContactInfoUpdateInDto): Promise<void> {
    if (dto.name) {
      const contactInfo = await this.pgService.contactInfos.findOne({
        where: { name: dto.name },
      });

      if (contactInfo && contactInfo.id !== id) {
        throw new ConflictException(
          `Contact Info with name "${dto.name}" already exists`,
        );
      }
    }

    const contactInfo = await this.pgService.contactInfos.findOne({
      where: { id },
    });

    if (!contactInfo) {
      throw new NotFoundException(`Contact Info with ID ${id} not found`);
    }

    const municipality = await this.pgService.municipalities.findOne({
      where: { id: dto.municipalityId },
    });

    if (!municipality) {
      throw new BadRequestException(
        `Municipality Associated with ${id} not found`,
      );
    }

    let patchDto = createPatchFields(dto);
    await this.pgService.contactInfos.update(id, patchDto);
    this.logger.log(`Updated Contact Info with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const contactInfoToDelete = await this.pgService.contactInfos.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (contactInfoToDelete) {
      if (contactInfoToDelete.orders && contactInfoToDelete.orders.length > 0) {
        throw new ConflictException(
          `Contact Info with ID ${id} has Associated Orders`,
        );
      }
    }

    const result = await this.pgService.contactInfos.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact Info with ID ${id} not found`);
    }
    this.logger.log(`Deleted Contact Info with ID ${id}`);
  }

  private toOutDto(contactInfo: ContactInfo): ContactInfoOutDto {
    const dto = new ContactInfoOutDto();
    dto.id = contactInfo.id;
    dto.name = contactInfo.name;
    dto.municipalityId = contactInfo.municipalityId;
    dto.address = contactInfo.address;
    dto.identificationNumber = contactInfo.identificationNumber;
    dto.observations = contactInfo.observations;
    dto.phoneNumber = contactInfo.phoneNumber;
    dto.userId = contactInfo.userId;

    return dto;
  }

  private toOutWithMunicipalitiesDto(
    contactInfo: ContactInfo,
  ): ContactInfoWithMunicipalityOutDto {
    const dto = new ContactInfoWithMunicipalityOutDto();
    dto.id = contactInfo.id;
    dto.name = contactInfo.name;
    dto.municipality = {
      id: contactInfo.municipality.id,
      name: contactInfo.municipality.name,
      provinceId: contactInfo.municipality.provinceId,
      provinceName: contactInfo.municipality.province.name,
    };
    dto.address = contactInfo.address;
    dto.identificationNumber = contactInfo.identificationNumber;
    dto.observations = contactInfo.observations;
    dto.phoneNumber = contactInfo.phoneNumber;
    dto.userId = contactInfo.userId;

    return dto;
  }
}
