import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProductCombo from '../../database/entities/product-combo.entity';
import ProductComboOutDto from '../dto/out/product-combo.out.dto';
import { In } from 'typeorm';
import ProductComboUpdateInDto from '../dto/in/product-combo.update.in.dto';
import ProductComboInDto from '../dto/in/product-combo.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProductComboSearchInDto from '../dto/in/product-combo.search.in.dto';

@Injectable()
export default class ProductCombosService {
  private readonly logger = new Logger(ProductCombosService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: ProductComboSearchInDto,
  ): Promise<PaginatedOutDto<ProductComboOutDto>> {
    const queryBuilder = this.pgService.productCombos
      .createQueryBuilder('productCombo')
      .leftJoinAndSelect('productCombo.zone', 'zone')
      .leftJoinAndSelect('productCombo.productComboItems', 'productComboItems')
      .leftJoinAndSelect('productComboItems.product', 'product');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'productCombo.name ILIKE :search OR productCombo.description ILIKE :search OR productCombo.shortDescription ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.zoneId) {
      queryBuilder.andWhere('zone.id = :zoneId', { provinceId: dto.zoneId });
    }

    if (dto.productId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: dto.productId,
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
    queryBuilder.orderBy(`productCombo.${orderBy}`, orderDirection);

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

  async getAll(): Promise<ProductComboOutDto[]> {
    const productCombos = await this.pgService.productCombos
      .createQueryBuilder('productCombo')
      .leftJoinAndSelect('productCombo.zone', 'zone')
      .leftJoinAndSelect('productCombo.productComboItems', 'productComboItems')
      .leftJoinAndSelect('productComboItems.product', 'product')
      .getMany();

    return productCombos.map((pc) => this.toOutDto(pc));
  }

  async getById(id: number): Promise<ProductComboOutDto> {
    const productCombo = await this.pgService.productCombos
      .createQueryBuilder('productCombo')
      .leftJoinAndSelect('productCombo.zone', 'zone')
      .leftJoinAndSelect('productCombo.productComboItems', 'productComboItems')
      .leftJoinAndSelect('productComboItems.product', 'product')
      .where('productCombo.id = :id', { id })
      .getOne();

    if (!productCombo) {
      throw new NotFoundException(`Product Combo with ID ${id} not found`);
    }

    return this.toOutDto(productCombo);
  }

  async post(dto: ProductComboInDto): Promise<ProductComboOutDto> {
    const existingProductCombo = await this.pgService.productCombos.findOne({
      where: { name: dto.name },
    });

    if (existingProductCombo) {
      throw new ConflictException(
        `Product Combo with name "${dto.name}" already exists`,
      );
    }

    const zone = await this.pgService.zones.findOne({
      where: { id: dto.zoneId },
    });
    if (!zone) {
      throw new BadRequestException(`Zone with ID ${dto.zoneId} not found`);
    }

    const products = await this.pgService.products.findBy({
      id: In(dto.productComboItems.map((x) => x.productId)),
    });

    if (products.length !== dto.productComboItems.length) {
      throw new BadRequestException('Non Valid Associated Products');
    }

    const newProductCombo = this.pgService.productCombos.create({
      name: dto.name,
      description: dto.description,
      productComboItems: [],
      image: dto.image,
      isActive: dto.isActive,
      price: dto.price,
      zoneId: zone.id,
      shortDescription: dto.shortDescription,
    });
    await this.pgService.productCombos.save(newProductCombo);

    const newProductComboItems = dto.productComboItems.map((x) => {
      return this.pgService.productComboItems.create({
        productComboId: newProductCombo.id,
        productId: x.productId,
        amount: x.amount,
      });
    });

    await this.pgService.productComboItems.save(newProductComboItems);

    newProductCombo.productComboItems = newProductComboItems;

    this.logger.log(`Created new product combo with ID ${newProductCombo.id}`);

    return this.toOutDto(newProductCombo);
  }

  async patch(id: number, dto: ProductComboUpdateInDto): Promise<void> {
    if (dto.name) {
      const productCombo = await this.pgService.productCombos.findOne({
        where: { name: dto.name },
      });

      if (productCombo && productCombo.id !== id) {
        throw new ConflictException(
          `Product Combo with name "${dto.name}" already exists`,
        );
      }
    }

    const productCombo = await this.pgService.productCombos.findOne({
      where: { id },
    });

    if (!productCombo) {
      throw new NotFoundException(`ProductCombo with ID ${id} not found`);
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
    patchDto = {
      ...patchDto,
      ...(dto.shortDescription
        ? { shortDescription: dto.shortDescription }
        : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.image !== undefined ? { image: dto.image } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.price ? { price: dto.price } : {}),
    };
    if (dto.zoneId) {
      const zone = await this.pgService.zones.findOne({
        where: { id: dto.zoneId },
      });
      if (!zone) {
        throw new BadRequestException(`Zone with ID ${dto.zoneId} not found`);
      }
      patchDto = {
        ...patchDto,
        ...(dto.zoneId ? { zoneId: dto.zoneId } : {}),
      };
    }
    patchDto = {
      ...patchDto,
      ...(dto.isActive !== undefined && dto.isActive !== null
        ? { isActive: dto.isActive }
        : {}),
    };
    if (dto.productComboItems) {
      const products = await this.pgService.products.findBy({
        id: In(dto.productComboItems.map((x) => x.productId)),
      });

      if (products.length !== dto.productComboItems.length) {
        throw new BadRequestException('Non Valid Associated Products');
      }

      patchDto = {
        ...patchDto,
        ...{
          productComboItems: dto.productComboItems.map((x) => ({
            productComboId: productCombo.id,
            productId: x.productId,
            amount: x.amount,
          })),
        },
      };
    }
    await this.pgService.productCombos.update(id, patchDto);
    this.logger.log(`Updated Product Combo with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const productComboToDelete = await this.pgService.productCombos.findOne({
      where: { id },
      relations: ['promotions'],
    });

    if (productComboToDelete) {
      if (
        productComboToDelete.promotions &&
        productComboToDelete.promotions.length > 0
      ) {
        throw new ConflictException(
          `Product Combo with ID ${id} has Associated Promotions`,
        );
      }
    }

    const result = await this.pgService.productCombos.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product Combo with ID ${id} not found`);
    }
    this.logger.log(`Deleted Product Combo with ID ${id}`);
  }

  private toOutDto(productCombo: ProductCombo): ProductComboOutDto {
    const dto = new ProductComboOutDto();
    dto.id = productCombo.id;
    dto.description = productCombo.description;
    dto.name = productCombo.name;
    dto.image = productCombo.image;
    dto.isActive = productCombo.isActive;
    dto.price = parseFloat(productCombo.price.toString());
    dto.shortDescription = productCombo.shortDescription;
    dto.zoneId = productCombo.zoneId;
    dto.zoneName = productCombo.zone?.name ?? '';
    dto.referencePrice = productCombo.productComboItems.reduce(
      (a, b) => a + b.amount,
      0,
    );
    dto.productComboItems =
      productCombo.productComboItems?.map((x) => ({
        id: x.id,
        productId: x.productId,
        amount: x.amount,
        productName: x.product?.name ?? '',
      })) ?? [];

    return dto;
  }
}
