import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import ProductOutDto from '../../products/dto/out/product.out.dto';
import Product from '../../database/entities/product.entity';
import PgService from '../../database/services/pg.service';
import { MoreThan } from 'typeorm';
import AvailableItemsByMunicipalityOutDto from '../dto/out/available-by-municipality.out.dto';

@Injectable()
export default class ShoppingCartsService {
  private readonly logger = new Logger(ShoppingCartsService.name);

  constructor(private readonly pgService: PgService) {}

  async getAvailableProductsByMunicipality(
    municipalityId: number,
  ): Promise<AvailableItemsByMunicipalityOutDto> {
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
        products: [],
        productCombos: [],
      };
    }

    const productCombos = await this.pgService.productCombos
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
      .andWhere('product.id IN (:...productIds)', { productIds })
      .getMany();

    const productInventoryMap = new Map<number, number>();

    products.forEach((product) => {
      const totalQuantity = product.inventoryEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0,
      );
      productInventoryMap.set(product.id, totalQuantity);
    });

    return {
      products: products.map((x) => ({
        product: {
          id: x.id,
          name: x.name,
          description: x.description,
          isService: x.isService,
          categoryId: x.categoryId,
          shortDescription: x.shortDescription,
          categoryName: x.category.name,
        },
        inventoryAmount: productInventoryMap.get(x.id),
        price: x.inventoryEntries.reduce(
          (a, b) => a + parseFloat(b.price.toString()),
          0,
        ),
      })),
      productCombos: productCombos.map((x) => {
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
        };
      }),
    };
  }
}
