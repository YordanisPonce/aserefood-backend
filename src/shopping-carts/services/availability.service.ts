import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ProductAvailabilitySearchInDto from '../dto/in/product-availability.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import { ProductAvailableByMunicipalityOutDto } from '../dto/out/product-available-by-municipality.out..dto';
import ProductComboAvailabilitySearchInDto from '../dto/in/product-combo-availability.search.in.dto';
import { ProductComboAvailableByMunicipalityOutDto } from '../dto/out/product-combo-available-by-municipality.out.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export default class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(private readonly pgService: PgService) {}

  async getAvailableProductsByMunicipality(
    municipalityId: number,
    dto: ProductAvailabilitySearchInDto,
  ): Promise<PaginatedOutDto<ProductAvailableByMunicipalityOutDto>> {
    const municipality = await this.pgService.municipalities.findOne({
      where: { id: municipalityId },
    });
    if (!municipality) {
      throw new NotFoundException('Municipality does not exist');
    }

    const queryBuilder = this.pgService.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('inventoryEntry.zone', 'zone')
      .leftJoinAndSelect('zone.municipalities', 'municipality')
      .leftJoinAndSelect('product.category', 'category')
      .where('municipality.id = :municipalityId', {
        municipalityId: municipalityId,
      })
      .andWhere('inventoryEntry.quantity > 0');

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

  async getAvailableProductCombosByMunicipality(
    municipalityId: number,
    dto: ProductComboAvailabilitySearchInDto,
  ): Promise<PaginatedOutDto<ProductComboAvailableByMunicipalityOutDto>> {
    const municipality = await this.pgService.municipalities.findOne({
      where: { id: municipalityId },
    });
    if (!municipality) {
      throw new NotFoundException('Municipality does not exist');
    }

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
}
