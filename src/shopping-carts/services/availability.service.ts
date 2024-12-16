import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProductAvailabilitySearchInDto from '../dto/in/availability/product-availability.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { ProductAvailableByMunicipalityOutDto } from '../dto/out/availability/product-available-by-municipality.out..dto';
import ProductComboAvailabilitySearchInDto from '../dto/in/availability/product-combo-availability.search.in.dto';
import { ProductComboAvailableByMunicipalityOutDto } from '../dto/out/availability/product-combo-available-by-municipality.out.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export default class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(private readonly pgService: PgService) {}

  async getAvailableProductsByMunicipality(
    userId: number,
    dto: ProductAvailabilitySearchInDto,
    productIds: number[] | null = null,
    quantityCheck: boolean = true,
  ): Promise<PaginatedOutDto<ProductAvailableByMunicipalityOutDto>> {
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

    const municipalityId = identityCart.municipalityId;

    const queryBuilder = this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.category', 'category')
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
      queryBuilder.andWhere('product.categoryId IN (:...categoryIds)', {
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

    // Pagination
    const [products, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    return {
      data: products.map((x) => ({
        product: {
          id: x.id,
          name: x.name,
          image: x.image,
          isService: x.isService,
          categoryId: x.categoryId,
          shortDescription: x.shortDescription,
          categoryName: x.category.name,
          description: x.description,
        },
        inventoryAmount: productInventoryMap.get(x.id),
        price: x.inventoryEntries.reduce(
          (a, b) => a + parseFloat(b.price.toString()),
          0,
        ),
      })),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAvailableProductCombosByMunicipality(
    userId: number,
    dto: ProductComboAvailabilitySearchInDto,
    productComboIds: number[] | null = null,
    quantityCheck: boolean = true,
  ): Promise<PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>> {
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

    const municipalityId = identityCart.municipalityId;

    const products = await this.pgService.products.find({
      where: {
        inventoryEntries: {
          zone: { municipalities: { id: municipalityId } },
          ...(quantityCheck ? { quantity: MoreThan(0) } : {}),
        },
      },
      relations: ['inventoryEntries', 'category'],
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

    // Pagination
    const [productCombos, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    return {
      data: productCombos.map((x) => {
        let maxCombos = Infinity;

        x.productComboItems.forEach((item) => {
          const availableQuantity =
            productInventoryMap.get(item.productId) || 0;
          const possibleCombos = Math.floor(availableQuantity / item.amount);

          if (possibleCombos < maxCombos) {
            maxCombos = possibleCombos;
          }
        });

        return {
          productCombo: {
            id: x.id,
            name: x.name,
            description: x.description,
            shortDescription: x.shortDescription,
            isActive: x.isActive,
            image: x.image,
            price: parseFloat(x.price.toString()),
            zoneId: x.zoneId,
            zoneName: x.zone.name,
            referencePrice: x.productComboItems.reduce(
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
            productComboItems: x.productComboItems.map((y) => ({
              id: y.id,
              productId: y.productId,
              productName: y.product.name,
              amount: y.amount,
            })),
          },
          inventoryAmount: maxCombos === Infinity ? 0 : maxCombos,
          price: parseFloat(x.price.toString()),
        };
      }),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAvailableProductsByMunicipalityId(
    municipalityId: number,
    dto: ProductAvailabilitySearchInDto,
  ): Promise<PaginatedOutDto<ProductAvailableByMunicipalityOutDto>> {
    const queryBuilder = this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.category', 'category')
      .where('municipality.id = :municipalityId', {
        municipalityId: municipalityId,
      });

    queryBuilder.andWhere('inventoryEntry.quantity > 0');

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
      queryBuilder.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds: dto.categoryIds,
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
    const [products, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    return {
      data: products.map((x) => ({
        product: {
          id: x.id,
          name: x.name,
          image: x.image,
          isService: x.isService,
          categoryId: x.categoryId,
          shortDescription: x.shortDescription,
          categoryName: x.category.name,
          description: x.description,
        },
        inventoryAmount: productInventoryMap.get(x.id),
        price: x.inventoryEntries.reduce(
          (a, b) => a + parseFloat(b.price.toString()),
          0,
        ),
      })),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAvailableProductCombosByMunicipalityId(
    municipalityId: number,
    dto: ProductComboAvailabilitySearchInDto,
  ): Promise<PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>> {
    const products = await this.pgService.products.find({
      where: {
        inventoryEntries: {
          zone: { municipalities: { id: municipalityId } },
          quantity: MoreThan(0),
        },
      },
      relations: ['inventoryEntries', 'category'],
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

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`productCombo.${orderBy}`, orderDirection);

    // Pagination
    const [productCombos, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    return {
      data: productCombos.map((x) => {
        let maxCombos = Infinity;

        x.productComboItems.forEach((item) => {
          const availableQuantity =
            productInventoryMap.get(item.productId) || 0;
          const possibleCombos = Math.floor(availableQuantity / item.amount);

          if (possibleCombos < maxCombos) {
            maxCombos = possibleCombos;
          }
        });

        return {
          productCombo: {
            id: x.id,
            name: x.name,
            description: x.description,
            shortDescription: x.shortDescription,
            isActive: x.isActive,
            image: x.image,
            price: parseFloat(x.price.toString()),
            zoneId: x.zoneId,
            zoneName: x.zone.name,
            referencePrice: x.productComboItems.reduce(
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
            productComboItems: x.productComboItems.map((y) => ({
              id: y.id,
              productId: y.productId,
              productName: y.product.name,
              amount: y.amount,
            })),
          },
          inventoryAmount: maxCombos === Infinity ? 0 : maxCombos,
          price: parseFloat(x.price.toString()),
        };
      }),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAvailableProductById(
    id: number,
    municipalityId: number
  ): Promise<ProductAvailableByMunicipalityOutDto> {
    const product = await this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.category', 'category')
      .where('municipality.id = :municipalityId', { municipalityId: municipalityId, })
      .andWhere('product.id = :productId', { productId: id, })
      .getOne();

    if(!product){
      throw new BadRequestException('Product Non Available.');
    }

    const totalQuantity = product.inventoryEntries.reduce(
      (sum, entry) => sum + entry.quantity,
      0,
    );

    return {
      product: {
        id: product.id,
        name: product.name,
        image: product.image,
        isService: product.isService,
        categoryId: product.categoryId,
        shortDescription: product.shortDescription,
        categoryName: product.category.name,
        description: product.description,
      },
      inventoryAmount: totalQuantity,
      price: product.inventoryEntries.reduce(
        (a, b) => a + parseFloat(b.price.toString()),
        0,
      ),
    };
  }

  async getAvailableProductByIdCustomer(
    id: number,
    userId: number
  ): Promise<ProductAvailableByMunicipalityOutDto> {
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

    const municipalityId = identityCart.municipalityId;

    const product = await this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.category', 'category')
      .where('municipality.id = :municipalityId', { municipalityId: municipalityId, })
      .andWhere('product.id = :productId', { productId: id, })
      .getOne();

    if(!product){
      throw new BadRequestException('Product Non Available.');
    }

    const totalQuantity = product.inventoryEntries.reduce(
      (sum, entry) => sum + entry.quantity,
      0,
    );

    return {
      product: {
        id: product.id,
        name: product.name,
        image: product.image,
        isService: product.isService,
        categoryId: product.categoryId,
        shortDescription: product.shortDescription,
        categoryName: product.category.name,
        description: product.description,
      },
      inventoryAmount: totalQuantity,
      price: product.inventoryEntries.reduce(
        (a, b) => a + parseFloat(b.price.toString()),
        0,
      ),
    };
  }

  async getAvailableProductComboByMunicipalityCustomer(
    id: number,
    userId: number,
  ): Promise<ProductComboAvailableByMunicipalityOutDto> {
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

    const municipalityId = identityCart.municipalityId;

    const products = await this.pgService.products.find({
      where: {
        inventoryEntries: {
          zone: { municipalities: { id: municipalityId } },
          quantity: MoreThan(0),
        },
      },
      relations: ['inventoryEntries', 'category'],
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

    let maxCombos = Infinity;

    productCombo.productComboItems.forEach((item) => {
      const availableQuantity =
        productInventoryMap.get(item.productId) || 0;
      const possibleCombos = Math.floor(availableQuantity / item.amount);

      if (possibleCombos < maxCombos) {
        maxCombos = possibleCombos;
      }
    });

    return {
      productCombo: {
        id: productCombo.id,
        name: productCombo.name,
        description: productCombo.description,
        shortDescription: productCombo.shortDescription,
        isActive: productCombo.isActive,
        image: productCombo.image,
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
      },
      inventoryAmount: maxCombos === Infinity ? 0 : maxCombos,
      price: parseFloat(productCombo.price.toString()),
    };
  }

  async getAvailableProductComboByMunicipality(
    id: number,
    municipalityId: number,
  ): Promise<ProductComboAvailableByMunicipalityOutDto> {
    const products = await this.pgService.products.find({
      where: {
        inventoryEntries: {
          zone: { municipalities: { id: municipalityId } },
          quantity: MoreThan(0),
        },
      },
      relations: ['inventoryEntries', 'category'],
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

    let maxCombos = Infinity;

    productCombo.productComboItems.forEach((item) => {
      const availableQuantity =
        productInventoryMap.get(item.productId) || 0;
      const possibleCombos = Math.floor(availableQuantity / item.amount);

      if (possibleCombos < maxCombos) {
        maxCombos = possibleCombos;
      }
    });

    return {
      productCombo: {
        id: productCombo.id,
        name: productCombo.name,
        description: productCombo.description,
        shortDescription: productCombo.shortDescription,
        isActive: productCombo.isActive,
        image: productCombo.image,
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
      },
      inventoryAmount: maxCombos === Infinity ? 0 : maxCombos,
      price: parseFloat(productCombo.price.toString()),
    };
  }
}
