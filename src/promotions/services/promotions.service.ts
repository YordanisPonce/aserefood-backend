import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProductCombo from '../../database/entities/product-combo.entity';
import Promotion from '../../database/entities/promotion.entity';
import PromotionOutDto from '../dto/out/promotion.out.dto';
import { In } from 'typeorm';
import PromotionUpdateInDto from '../dto/in/promotion.update.in.dto';
import compareDatesOnly from '../../utils/dto/dates.util';
import PromotionInDto from '../dto/in/promotion.in.dto';
import Product from '../../database/entities/product.entity';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import PromotionSearchInDto from '../dto/in/promotion.search.in.dto';
import MinioService from '../../minio/services/minio.service';

@Injectable()
export default class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly minioService: MinioService,
  ) {}

  async search(
    dto: PromotionSearchInDto,
  ): Promise<PaginatedOutDto<PromotionOutDto>> {
    const queryBuilder = this.pgService.promotions
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.productCombos', 'productCombo')
      .leftJoinAndSelect('promotion.products', 'product');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'promotion.name ILIKE :search OR promotion.code ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.productId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: dto.productId,
      });
    }

    if (dto.productComboId) {
      queryBuilder.andWhere('productCombo.id = :productComboId', {
        productComboId: dto.productComboId,
      });
    }

    if (dto.isActive !== undefined && dto.isActive !== null) {
      queryBuilder.andWhere('productCombo.isActive = :isActive', {
        isActive: dto.isActive,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`promotion.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const data: PromotionOutDto[] = []
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

  async getAll(): Promise<PromotionOutDto[]> {
    const promotions = await this.pgService.promotions
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.productCombos', 'productCombo')
      .leftJoinAndSelect('promotion.products', 'product')
      .getMany();

    const data: PromotionOutDto[] = []
    for (const item of promotions) {
      data.push(await this.toOutDto(item));
    }

    return data;
  }

  async getById(id: number): Promise<PromotionOutDto> {
    const promotion = await this.pgService.promotions
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.productCombos', 'productCombo')
      .leftJoinAndSelect('promotion.products', 'product')
      .where('promotion.id = :id', { id })
      .getOne();

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return this.toOutDto(promotion);
  }

  async post(dto: PromotionInDto): Promise<PromotionOutDto> {
    const existingPromotion = await this.pgService.promotions.findOne({
      where: { code: dto.code },
    });

    if (existingPromotion) {
      throw new ConflictException(
        `Promotion with code "${dto.code}" already exists`,
      );
    }

    const sd = dto.startDate;
    const ed = dto.endDate;

    if (compareDatesOnly(sd, ed) === 1) {
      throw new BadRequestException(
        'Start Date must be less or equal than End Date',
      );
    }

    if (
      (!dto.productIds || dto.productIds.length === 0) &&
      (!dto.productComboIds || dto.productComboIds.length === 0)
    ) {
      throw new BadRequestException(
        'Promotion must have at least 1 product or 1 product combo',
      );
    }

    let products: Product[] = [];
    let productCombos: ProductCombo[] = [];

    if (dto.productIds) {
      products = await this.pgService.products.findBy({
        id: In(dto.productIds),
      });

      if (products.length !== dto.productIds.length) {
        throw new BadRequestException('Non Valid Associated Products');
      }
    }

    if (dto.productComboIds) {
      productCombos = await this.pgService.productCombos.findBy({
        id: In(dto.productComboIds),
      });

      if (productCombos.length !== dto.productComboIds.length) {
        throw new BadRequestException('Non Valid Associated Product Combos');
      }
    }

    const image = await this.minioService.uploadFile(
      undefined,
      dto.image.buffer,
      dto.image.originalname.split('.').pop(),
      dto.image.mimetype,
    );

    const newPromotion = this.pgService.promotions.create({
      name: dto.name,
      description: dto.description,
      image: image,
      isActive: dto.isActive,
      endDate: dto.endDate,
      productCombos: productCombos,
      startDate: dto.startDate,
      products: products,
      code: dto.code,
      discountOption: dto.discountOption,
      discountValue: dto.discountValue,
    });
    await this.pgService.promotions.save(newPromotion);

    this.logger.log(`Created new promotion with ID ${newPromotion.id}`);

    return this.toOutDto(newPromotion);
  }

  async patch(id: number, dto: PromotionUpdateInDto): Promise<void> {
    if (dto.code) {
      const promotion = await this.pgService.promotions.findOne({
        where: { code: dto.code },
      });

      if (promotion && promotion.id !== id) {
        throw new ConflictException(
          `Promotion with code "${dto.code}" already exists`,
        );
      }
    }

    const productIds = dto.productIds !== undefined ? dto.productIds : [1];
    const productComboIds =
      dto.productComboIds !== undefined ? dto.productComboIds : [1];

    if (
      (!productIds || productIds.length === 0) &&
      (!productComboIds || productComboIds.length === 0)
    ) {
      throw new BadRequestException(
        'Promotion must have at least 1 product or 1 product combo',
      );
    }

    const promotion = await this.pgService.promotions.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    const sd = dto.startDate ? dto.startDate : promotion.startDate;
    const ed = dto.endDate ? dto.endDate : promotion.endDate;

    if (compareDatesOnly(sd, ed) === 1) {
      throw new BadRequestException(
        'Start Date must be less or equal than End Date',
      );
    }

    let image = undefined;
    if (dto.image) {
      image = await this.minioService.uploadFile(
        promotion.image ?? undefined,
        dto.image.buffer,
        undefined,
        dto.image.mimetype,
      );
    }

    let patchDto = {
      ...(dto.code ? { code: dto.code } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.name !== undefined ? { name: dto.name } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.discountOption ? { discountOption: dto.discountOption } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.image !== undefined ? { image: image } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.discountValue ? { discountValue: dto.discountValue } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.startDate ? { startDate: dto.startDate } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.endDate ? { endDate: dto.endDate } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.isActive !== undefined && dto.isActive !== null
        ? { isActive: dto.isActive }
        : {}),
    };
    await this.pgService.promotions.update(id, patchDto);

    const p = await this.pgService.promotions.findOne({
      where: { id },
      relations: ['products', 'productCombos'],
    });

    if (dto.productIds) {
      const products = await this.pgService.products.findBy({
        id: In(dto.productIds),
      });

      if (products.length !== dto.productIds.length) {
        throw new BadRequestException('Non Valid Associated Products');
      }

      p.products = products;
    } else if (dto.productIds === null) {
      p.products = [];
    }
    if (dto.productComboIds) {
      const productCombos = await this.pgService.productCombos.findBy({
        id: In(dto.productComboIds),
      });

      if (productCombos.length !== dto.productComboIds.length) {
        throw new BadRequestException('Non Valid Associated Product Combos');
      }

      p.productCombos = productCombos;
    } else if (dto.productComboIds === null) {
      p.productCombos = [];
    }

    await this.pgService.promotions.save(p);
    this.logger.log(`Updated Promotion with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const promotionToDelete = await this.pgService.promotions.findOne({
      where: { id },
    });
    const result = await this.pgService.promotions.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    try {
      await this.minioService.deleteFile(promotionToDelete?.image);
    } catch (e) {
      this.logger.error(e);
    }

    this.logger.log(`Deleted Promotion with ID ${id}`);
  }

  private async toOutDto(promotion: Promotion): Promise<PromotionOutDto> {
    const dto = new PromotionOutDto();
    dto.id = promotion.id;
    dto.name = promotion.name;
    dto.startDate = promotion.startDate;
    dto.endDate = promotion.endDate;
    dto.code = promotion.code;
    dto.name = promotion.name;
    dto.description = promotion.description;
    dto.discountOption = promotion.discountOption;
    dto.discountValue = parseFloat(promotion.discountValue.toString());
    dto.image = promotion.image ? await this.minioService.getPresignedUrl(promotion.image) : null;
    dto.isActive = promotion.isActive;
    dto.productCombos =
      promotion.productCombos?.map((x) => ({
        name: x.name,
        id: x.id,
      })) ?? [];
    dto.products =
      promotion.products?.map((x) => ({
        id: x.id,
        name: x.name,
      })) ?? [];

    return dto;
  }
}