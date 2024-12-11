import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProvidersService from '../../providers/services/providers.service';
import Product from '../../database/entities/product.entity';
import ProductOutDto from '../dto/out/product.out.dto';
import ProductWithProvidersOutDto from '../dto/out/product-with-providers.out.dto';
import { In } from 'typeorm';
import ProductUpdateInDto from '../dto/in/product.update.in.dto';
import ProductInDto from '../dto/in/product.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import ProductSearchInDto from '../dto/in/product.search.in.dto';

@Injectable()
export default class ProductsService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: ProductSearchInDto,
  ): Promise<PaginatedOutDto<ProductOutDto>> {
    const queryBuilder = this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.providers', 'provider')
      .leftJoinAndSelect('product.category', 'category');

    // Filtering
    if (dto.search) {
      queryBuilder.where(
        'product.name ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      queryBuilder.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds: dto.categoryIds,
      });
    }

    if (dto.providerId) {
      queryBuilder.andWhere('provider.id = :providerId', {
        providerId: dto.providerId,
      });
    }

    if (dto.isService !== undefined && dto.isService !== null) {
      queryBuilder.andWhere('provider.isService = :isService', {
        isService: dto.isService,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`product.${orderBy}`, orderDirection);

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

  async getAll(): Promise<ProductWithProvidersOutDto[]> {
    const products = await this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.providers', 'provider')
      .leftJoinAndSelect('product.category', 'category')
      .getMany();

    return products.map((x) => this.toOutWithProvidersDto(x));
  }

  async getById(id: number): Promise<ProductWithProvidersOutDto> {
    const product = await this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.providers', 'provider')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toOutWithProvidersDto(product);
  }

  async post(dto: ProductInDto): Promise<ProductOutDto> {
    const existingProductByName = await this.pgService.products.findOne({
      where: { name: dto.name },
    });

    if (existingProductByName) {
      throw new ConflictException(
        `Product with name "${dto.name}" already exists`,
      );
    }

    const providers = await this.pgService.providers.findBy({
      id: In(dto.providerIds),
    });

    if (providers.length === 0) {
      throw new BadRequestException('Non Valid Associated Providers');
    }

    const newProduct = this.pgService.products.create({
      name: dto.name,
      description: dto.description,
      shortDescription: dto.shortDescription,
      isService: dto.isService,
      categoryId: dto.categoryId,
      providers: providers,
      image: dto.image
    });
    await this.pgService.products.save(newProduct);

    this.logger.log(`Created new product with ID ${newProduct.id}`);

    return this.toOutDto(newProduct);
  }

  async patch(id: number, dto: ProductUpdateInDto): Promise<void> {
    if (dto.name) {
      const product = await this.pgService.products.findOne({
        where: { name: dto.name },
      });

      if (product && product.id !== id) {
        throw new ConflictException(
          `Product with name "${dto.name}" already exists`,
        );
      }
    }

    const product = await this.pgService.products.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
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
      ...(dto.image !== undefined
        ? { image: dto.image }
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
      ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
    };
    patchDto = {
      ...patchDto,
      ...(dto.isService ? { isService: dto.isService } : {}),
    };
    await this.pgService.products.update(id, patchDto);

    if (dto.providerIds) {
      const product = await this.pgService.products.findOne({
        where: { id },
      });

      const providers = await this.pgService.providers.findBy({
        id: In(dto.providerIds),
      });

      if (providers.length === 0) {
        throw new BadRequestException('Non Valid Associated Providers');
      }

      product.providers = providers;
      await this.pgService.products.save(product);
    }

    this.logger.log(`Updated product with ID ${id}`);
    this.logger.log({ ...dto });
  }

  async delete(id: number): Promise<void> {
    const productToDelete = await this.pgService.products.findOne({
      where: { id },
      relations: [
        'promotions',
        'inventoryEntries',
        'productComboItems',
        'shoppingCartItems',
        'orderItems',
      ],
    });

    if (productToDelete) {
      if (productToDelete.promotions && productToDelete.promotions.length > 0) {
        throw new ConflictException(
          `Product with ID ${id} has Associated Promotions`,
        );
      }
      if (
        productToDelete.inventoryEntries &&
        productToDelete.inventoryEntries.length > 0
      ) {
        throw new ConflictException(
          `Product with ID ${id} has Associated Inventory Entries`,
        );
      }
      if (
        productToDelete.productComboItems &&
        productToDelete.productComboItems.length > 0
      ) {
        throw new ConflictException(
          `Product with ID ${id} has Associated Product Combo Items`,
        );
      }
      if (
        productToDelete.shoppingCartItems &&
        productToDelete.shoppingCartItems.length > 0
      ) {
        throw new ConflictException(
          `Product with ID ${id} has Associated Shopping Cart Items`,
        );
      }
      if (productToDelete.orderItems && productToDelete.orderItems.length > 0) {
        throw new ConflictException(
          `Product with ID ${id} has Associated Order Items`,
        );
      }
    }

    const result = await this.pgService.products.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.logger.log(`Deleted Product with ID ${id}`);
  }

  private toOutDto(product: Product): ProductOutDto {
    const dto = new ProductOutDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.shortDescription = product.shortDescription;
    dto.isService = product.isService;
    dto.categoryId = product.categoryId;
    dto.categoryName = product.category?.name ?? '';
    dto.image = product.image;

    return dto;
  }

  private toOutWithProvidersDto(product: Product): ProductWithProvidersOutDto {
    const dto = new ProductWithProvidersOutDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.shortDescription = product.shortDescription;
    dto.isService = product.isService;
    dto.categoryId = product.categoryId;
    dto.categoryName = product.category.name;
    dto.providers = product.providers.map((x) => ({
      id: x.id,
      name: x.name,
    }));
    dto.image = product.image;

    return dto;
  }
}
