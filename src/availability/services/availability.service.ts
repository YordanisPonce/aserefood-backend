import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProductAvailabilitySearchInDto from '../dto/in/product-availability.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { ProductAvailableByMunicipalityOutDto } from '../dto/out/product-available-by-municipality.out..dto';
import ProductComboAvailabilitySearchInDto from '../dto/in/product-combo-availability.search.in.dto';
import { ProductComboAvailableByMunicipalityOutDto } from '../dto/out/product-combo-available-by-municipality.out.dto';
import { MoreThan } from 'typeorm';
import Product from '../../database/entities/product.entity';
import ProductCombo from '../../database/entities/product-combo.entity';
import MinioService from '../../minio/services/minio.service';

@Injectable()
export default class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly minioService: MinioService,
    ) {}

  async getAvailableProductsByMunicipality(
    userId: number,
    dto: ProductAvailabilitySearchInDto,
    productIds: number[] | null = null,
    quantityCheck: boolean = true,
  ): Promise<PaginatedOutDto<ProductAvailableByMunicipalityOutDto>> {
    return this.getAvailableProductsInMunicipality(
      (await this.getUserMunicipalityId(userId)),
      dto,
      productIds,
      quantityCheck,
    );
  }

  async getAvailableProductCombosByMunicipality(
    userId: number,
    dto: ProductComboAvailabilitySearchInDto,
    productComboIds: number[] | null = null,
    quantityCheck: boolean = true,
  ): Promise<PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>> {
    return this.getAvailableProductCombosInMunicipality(
      (await this.getUserMunicipalityId(userId)),
      dto,
      productComboIds,
      quantityCheck);
  }

  async getAvailableProductsByMunicipalityId(
    municipalityId: number,
    dto: ProductAvailabilitySearchInDto,
  ): Promise<PaginatedOutDto<ProductAvailableByMunicipalityOutDto>> {
    return this.getAvailableProductsInMunicipality(municipalityId, dto);
  }

  async getAvailableProductCombosByMunicipalityId(
    municipalityId: number,
    dto: ProductComboAvailabilitySearchInDto,
  ): Promise<PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>> {
    return this.getAvailableProductCombosInMunicipality(municipalityId, dto);
  }

  async getAvailableProductById(
    id: number,
    municipalityId: number,
  ): Promise<ProductAvailableByMunicipalityOutDto> {
   return this.getAvailableProduct(id, municipalityId);
  }

  async getAvailableProductByIdCustomer(
    id: number,
    userId: number,
  ): Promise<ProductAvailableByMunicipalityOutDto> {
    return this.getAvailableProduct(id, (await this.getUserMunicipalityId(userId)))
  }

  async getAvailableProductComboByMunicipalityCustomer(
    id: number,
    userId: number,
  ): Promise<ProductComboAvailableByMunicipalityOutDto> {
    return this.getAvailableProductCombo(id, (await this.getUserMunicipalityId(userId)))
  }

  async getAvailableProductComboByMunicipality(
    id: number,
    municipalityId: number,
  ): Promise<ProductComboAvailableByMunicipalityOutDto> {
    return this.getAvailableProductCombo(id, municipalityId);
  }

  private async getAvailableProductsInMunicipality(
    municipalityId: number,
    dto: ProductAvailabilitySearchInDto,
    productIds: number[] | null = null,
    quantityCheck: boolean = true,
  ): Promise<PaginatedOutDto<ProductAvailableByMunicipalityOutDto>> {
    const queryBuilder = this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.categories', 'category')
      .where('municipality.id = :municipalityId', {
        municipalityId: municipalityId,
      });

    if (quantityCheck) {
      queryBuilder.andWhere('inventoryEntry.quantity > 0');
    }

    // Filtering
    if (dto.search) {
      queryBuilder.andWhere(
        'product.name ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      queryBuilder.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: dto.categoryIds,
      });
    }

    if (dto.isService !== undefined && dto.isService !== null) {
      queryBuilder.andWhere('provider.isService = :isService', {
        isService: dto.isService,
      });
    }

    if (productIds !== null && productIds.length > 0) {
      queryBuilder.andWhere('product.id IN (:...productIds)', {
        productIds,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`product.${orderBy}`, orderDirection);

    const data = await queryBuilder.getMany();

    let products = [];
    for (const x of data) {
      products.push(this.mapToProductDto(x))
    }

    // Filtering
    if (dto.minimumPrice) {
      products = products.filter((x) => x.price >= dto.minimumPrice);
    }

    if (dto.maximumPrice) {
      products = products.filter((x) => x.price <= dto.maximumPrice);
    }

    // Pagination
    const total = products.length;
    products = products.slice((dto.page - 1) * dto.pageSize, dto.pageSize);

    return {
      data: products,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  private async getAvailableProductCombosInMunicipality(
    municipalityId: number,
    dto: ProductComboAvailabilitySearchInDto,
    productComboIds: number[] | null = null,
    quantityCheck: boolean = true,
  ): Promise<PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>> {
    const products = await this.pgService.products.find({
      where: {
        inventoryEntries: {
          zone: { municipalities: { id: municipalityId } },
          ...(quantityCheck ? { quantity: MoreThan(0) } : {}),
        },
      },
      relations: ['inventoryEntries', 'categories'],
    });

    const productIds = products.map((product) => product.id);

    if (productIds.length === 0) {
      return {
        page: dto.page,
        data: [],
        total: 0,
        pageSize: dto.pageSize,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    const queryBuilder = this.pgService.productCombos
      .createQueryBuilder('productCombo')
      .leftJoinAndSelect('productCombo.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('productCombo.productComboItems', 'productComboItem')
      .leftJoinAndSelect('productComboItem.product', 'product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .where('productCombo.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('municipality.id = :municipalityId', { municipalityId })
      .andWhere('product.id IN (:...productIds)', { productIds });

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

    if (productComboIds !== null && productComboIds.length > 0) {
      queryBuilder.andWhere('productCombo.id IN (:...productComboIds)', {
        productComboIds,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`productCombo.${orderBy}`, orderDirection);

    const data = await queryBuilder.getMany();
    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    let productCombos = [];
    for (const d of data) {
      productCombos.push(this.mapToProductCombo(d, products, productInventoryMap),);
    }

    // Filtering
    if (dto.minimumPrice) {
      productCombos = productCombos.filter((x) => x.price >= dto.minimumPrice);
    }

    if (dto.maximumPrice) {
      productCombos = productCombos.filter((x) => x.price <= dto.maximumPrice);
    }

    // Pagination
    const total = productCombos.length;
    productCombos = productCombos.slice(
      (dto.page - 1) * dto.pageSize,
      dto.pageSize,
    );

    return {
      data: productCombos,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  private async getAvailableProduct(
    id: number,
    municipalityId: number,
  ) {
    const product = await this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.categories', 'category')
      .where('municipality.id = :municipalityId', {
        municipalityId: municipalityId,
      })
      .andWhere('product.id = :productId', { productId: id })
      .getOne();

    if (!product) {
      throw new BadRequestException('Product Non Available.');
    }

    return this.mapToProductDto(product);
  }

  private async getAvailableProductCombo(
    id: number,
    municipalityId: number,
  ) {
    const products = await this.pgService.products.find({
      where: {
        inventoryEntries: {
          zone: { municipalities: { id: municipalityId } },
          quantity: MoreThan(0),
        },
      },
      relations: ['inventoryEntries', 'categories'],
    });

    const productIds = products.map((product) => product.id);

    if (productIds.length === 0) {
      throw new BadRequestException('Product Combo Non Available.');
    }

    const productCombo = await this.pgService.productCombos
      .createQueryBuilder('productCombo')
      .leftJoinAndSelect('productCombo.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('productCombo.productComboItems', 'productComboItem')
      .leftJoinAndSelect('productComboItem.product', 'product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .where('productCombo.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('productCombo.id = :id', { id })
      .andWhere('municipality.id = :municipalityId', { municipalityId })
      .andWhere('product.id IN (:...productIds)', { productIds })
      .getOne();

    if (!productCombo) {
      throw new BadRequestException('Product Combo Non Available.');
    }

    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    return this.mapToProductCombo(productCombo, products, productInventoryMap);
  }

  private async mapToProductDto(
    product: Product,
  ): Promise<ProductAvailableByMunicipalityOutDto> {
    const dto = new ProductAvailableByMunicipalityOutDto();
    dto.product = {
      id: product.id,
      name: product.name,
      image: product.image ? await this.minioService.getPresignedUrl(product.image) : null,
      isService: product.isService,
      categories: product.categories?.map(x => ({
        id: x.id,
        name: x.name,
      })) ?? [],
      shortDescription: product.shortDescription,
      description: product.description,
    };
    dto.inventoryAmount = product.inventoryEntries.reduce(
      (sum, entry) => sum + entry.quantity,
      0,
    );
    dto.price = product.inventoryEntries.reduce(
      (a, b) => a + parseFloat(b.price.toString()),
      0,
    );
    return dto;
  }

  private async mapToProductCombo(
    productCombo: ProductCombo,
    products: Product[],
    productInventoryMap: Map<number, number>,
  ): Promise<ProductComboAvailableByMunicipalityOutDto> {
    const dto = new ProductComboAvailableByMunicipalityOutDto();

    let maxCombos = Infinity;

    productCombo.productComboItems.forEach((item) => {
      const availableQuantity = productInventoryMap.get(item.productId) || 0;
      const possibleCombos = Math.floor(availableQuantity / item.amount);

      if (possibleCombos < maxCombos) {
        maxCombos = possibleCombos;
      }
    });

    dto.productCombo = {
      id: productCombo.id,
      name: productCombo.name,
      description: productCombo.description,
      shortDescription: productCombo.shortDescription,
      isActive: productCombo.isActive,
      image: productCombo.image ? await this.minioService.getPresignedUrl(productCombo.image) : null,
      price: parseFloat(productCombo.price.toString()),
      zoneId: productCombo.zoneId,
      zoneName: productCombo.zone.name,
      referencePrice: productCombo.productComboItems.reduce(
        (a, b) =>
          a +
          products
            .find((p) => p.id === b.productId)
            .inventoryEntries.reduce(
              (a, b) => a + parseFloat(b.price.toString()),
              0,
            ) *
            b.amount,
        0,
      ),
      productComboItems: productCombo.productComboItems.map((y) => ({
        id: y.id,
        productId: y.productId,
        productName: y.product.name,
        amount: y.amount,
      })),
    };
    dto.inventoryAmount = maxCombos === Infinity ? 0 : maxCombos;
    dto.price = parseFloat(productCombo.price.toString());

    return dto;
  }

  private async getUserMunicipalityId(userId: number): Promise<number> {
    const identityCart = await this.pgService.shoppingCarts.findOne({
      where: {
        userId: userId,
        productId: null,
        productComboId: null,
      },
    });
    if (!identityCart) {
      throw new ConflictException(
        `Municipality for User ${userId} has not been selected`,
      );
    }

    return identityCart.municipalityId
  }
}
