import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ContactInfo from '../../database/entities/contact-info.entity';
import ContactInfoOutDto from '../dto/out/contact-info.out.dto';
import ContactInfoWithMunicipalityOutDto from '../dto/out/contact-info-with-municipality.out.dto';
import ContactInfoUpdateInDto from '../dto/in/contact-info.update.in.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';
import ContactInfoInDto from '../dto/in/contact-info.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ContactInfoSearchInDto from '../dto/in/contact-info.search.in.dto';
import ContactInfoBackofficeSearchInDto from '../dto/in/contact-info-backoffice.search.in.dto';

@Injectable()
export default class ContactInfosService {
  private readonly logger = new Logger(ContactInfosService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: ContactInfoBackofficeSearchInDto,
    userId: number,
    isCustomer: boolean
  ): Promise<PaginatedOutDto<ContactInfoWithMunicipalityOutDto>> {
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

    if(isCustomer){
      queryBuilder.andWhere('contactInfo.isActive = true')
    } else if(dto.isActive !== undefined && dto.isActive !== null){
      queryBuilder.andWhere('contactInfo.isActive = :isActive', {
        isActive: dto.isActive,
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
      data: result.map((m) => this.toOutWithMunicipalitiesDto(m)),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(userId: number, isCustomer: boolean): Promise<ContactInfoWithMunicipalityOutDto[]> {
    const contactInfosQuery = this.pgService.contactInfos
      .createQueryBuilder('contactInfo')
      .leftJoinAndSelect('contactInfo.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .where('contactInfo.userId = :userId', { userId: userId });

    if(isCustomer){
      contactInfosQuery.andWhere('contactInfo.isActive = true')
    }

    const contactInfos = await contactInfosQuery.getMany();

    return contactInfos.map((ci) => this.toOutWithMunicipalitiesDto(ci));
  }

  async getById(id: number): Promise<ContactInfoWithMunicipalityOutDto> {
    const contactInfoQuery = this.pgService.contactInfos
      .createQueryBuilder('contactInfo')
      .leftJoinAndSelect('contactInfo.municipality', 'municipality')
      .leftJoinAndSelect('municipality.province', 'province')
      .where('contactInfo.id = :id', { id });

    const contactInfo = await contactInfoQuery.getOne();

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
        where: { name: dto.name, userId: userId, isActive: true },
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

  async patch(id: number, dto: ContactInfoUpdateInDto, userId: number): Promise<void> {
    if (dto.name) {
      const contactInfo = await this.pgService.contactInfos.findOne({
        where: { name: dto.name, userId: userId, isActive: true },
      });

      if (contactInfo && contactInfo.id !== id) {
        throw new ConflictException(
          `Contact Info with name "${dto.name}" already exists`,
        );
      }
    }

    const contactInfo = await this.pgService.contactInfos.findOne({
      where: { id, userId },
    });

    if (!contactInfo) {
      throw new NotFoundException(`Contact Info with ID ${id} and User ${userId} not found`);
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
    await this.pgService.contactInfos.update(id, patchDto);
    this.logger.log(`Updated Contact Info with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number, userId: number): Promise<void> {
    const contactInfoToDelete = await this.pgService.contactInfos.findOne({
      where: { id, userId },
      relations: ['orders'],
    });

    if (contactInfoToDelete) {
      if (contactInfoToDelete.orders && contactInfoToDelete.orders.length > 0) {
        throw new ConflictException(
          `Contact Info with ID ${id} has Associated Orders`,
        );
      }
    } else{
      throw new NotFoundException(`Contact Info with ID ${id} and User ${userId} not found`);
    }

    const result = await this.pgService.contactInfos.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact Info with ID ${id} and User ${userId} not found`);
    }
    this.logger.log(`Deleted Contact Info with ID ${id} and User ${userId}`);
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
    dto.isActive = contactInfo.isActive;

    return dto;
  }
}
