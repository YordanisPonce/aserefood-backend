import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import AvailabilityService from './availability.service';
import AddToCartInDto from '../dto/in/shopping-cart/add-to-cart.in.dto';
import { CartItem } from '../dto/in/shopping-cart/cart-item.enum';
import CartProduct from '../../database/entities/cart-product.entity';
import { OrderDirection } from '../../utils/dto/in/paginated.in.dto';
import ShoppingCartOutDto, {
  ShoppingCartProductComboOutDto,
  ShoppingCartProductOutDto,
} from '../dto/out/shopping-cart/shopping-cart.out.dto';
import MunicipalityPOutDto from '../../provinces/dto/out/municipality-p.out.dto';

@Injectable()
export default class ShoppingCartsService {
  private readonly logger = new Logger(ShoppingCartsService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  public async addToCart(userId: number, dto: AddToCartInDto) {
    const user = await this.pgService.users.findOneBy({
      id: userId,
      isActive: true,
      isConfirmed: true,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }
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

    let existingCart: CartProduct;

    switch (dto.cartItemType) {
      case CartItem.Product:
        const product = await this.pgService.products.findOneBy({
          id: dto.itemId,
        });
        if (!product) {
          throw new NotFoundException(
            `Product with id ${dto.itemId} does not exist`,
          );
        }
        existingCart = await this.pgService.shoppingCarts.findOne({
          where: { userId, productId: dto.itemId },
        });
        break;

      case CartItem.ProductCombo:
        const productCombo = await this.pgService.productCombos.findOneBy({
          id: dto.itemId,
          isActive: true,
        });
        if (!productCombo) {
          throw new NotFoundException(
            `Product Combo with id ${dto.itemId} does not exist`,
          );
        }
        existingCart = await this.pgService.shoppingCarts.findOne({
          where: { userId, productComboId: dto.itemId },
        });
        break;
    }

    await this.manageInventory(
      identityCart.municipalityId,
      dto,
      existingCart ? existingCart.amount : 0,
      userId,
    );

    if (existingCart) {
      existingCart.amount = dto.amount;
      await this.pgService.shoppingCarts.save(existingCart);
    } else {
      const cart = this.pgService.shoppingCarts.create({
        userId: userId,
        amount: dto.amount,
        productComboId:
          dto.cartItemType === CartItem.ProductCombo ? dto.itemId : null,
        productId: dto.cartItemType === CartItem.Product ? dto.itemId : null,
        municipalityId: identityCart.municipalityId,
      });
      await this.pgService.shoppingCarts.save(cart);
    }
  }

  public async initMunicipality(userId: number, municipalityId: number) {
    const user = await this.pgService.users.findOneBy({
      id: userId,
      isActive: true,
      isConfirmed: true,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }

    const municipality = await this.pgService.municipalities.findOne({
      where: { id: municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException(
        `Municipality with id ${municipalityId} does not exist`,
      );
    }

    const identityCart = await this.pgService.shoppingCarts.findOne({
      where: {
        userId: userId,
        productId: null,
        productComboId: null,
      },
    });

    if (!identityCart) {
      const cart = this.pgService.shoppingCarts.create({
        userId: userId,
        productId: null,
        productComboId: null,
        amount: 0,
        municipalityId: municipalityId,
      });
      await this.pgService.shoppingCarts.save(cart);
    } else {
      identityCart.municipalityId = municipalityId;
      await this.pgService.shoppingCarts.save(identityCart);
      await this.checkInventory(userId, identityCart.municipalityId);
    }
  }

  public async getAllShoppingCart(userId: number): Promise<ShoppingCartOutDto> {
    const user = await this.pgService.users.findOneBy({
      id: userId,
      isActive: true,
      isConfirmed: true,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }
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

    const carts = (
      await this.pgService.shoppingCarts.find({
        where: {
          userId: userId,
        },
      })
    ).filter((x) => !(x.productId === null && x.productComboId === null));

    const productIds = carts
      .filter((x) => x.productId !== null)
      .map((x) => x.productId);

    const productComboIds = carts
      .filter((x) => x.productComboId !== null)
      .map((x) => x.productComboId);

    const aProducts =
      productIds.length > 0
        ? (
            await this.availabilityService.getAvailableProductsByMunicipality(
              userId,
              {
                page: 1,
                pageSize: 10_000,
                orderDirection: OrderDirection.ASC,
                orderBy: 'id',
              },
              productIds,
              false,
            )
          ).data
        : [];

    const aProductCombos =
      productComboIds.length > 0
        ? (
            await this.availabilityService.getAvailableProductCombosByMunicipality(
              userId,
              {
                page: 1,
                pageSize: 10_000,
                orderDirection: OrderDirection.ASC,
                orderBy: 'id',
              },
              productIds,
              false,
            )
          ).data
        : [];

    const products: ShoppingCartProductOutDto[] = aProducts.map((x) => ({
      price: x.price,
      amount: carts.find((y) => y.productId === x.product.id).amount,
      product: x.product,
    }));
    const productCombos: ShoppingCartProductComboOutDto[] = aProductCombos.map(
      (x) => ({
        productCombo: x.productCombo,
        amount: carts.find((y) => y.productComboId === x.productCombo.id)
          .amount,
        price: x.price,
      }),
    );

    const totalPrice =
      products.reduce((acc, x) => acc + x.price * x.amount, 0) +
      productCombos.reduce((acc, x) => acc + x.price * x.amount, 0);

    return {
      municipalityId: identityCart.municipalityId,
      totalPrice,
      products,
      productCombos,
    };
  }

  public async delete(userId: number, id: number, restoreInventory: boolean) {
    const cart = await this.pgService.shoppingCarts.findOne({
      where: { userId, id },
    });
    if (!cart) {
      throw new NotFoundException(
        `User with id ${userId} and cart item ${id} does not exist`,
      );
    }

    if (restoreInventory) {
      await this.manageInventory(
        cart.municipalityId,
        {
          cartItemType: cart.productId
            ? CartItem.Product
            : CartItem.ProductCombo,
          itemId: cart.productId ? cart.productId : cart.productComboId,
          amount: 0,
        },
        cart.amount,
        userId,
      );
    }

    const result = await this.pgService.shoppingCarts.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shopping Cart with ID ${id} not found`);
    }
    this.logger.log(`Deleted Shopping Cart with ID ${id}`);
  }

  public async deleteAll(userId: number, restoreInventory: boolean) {
    const carts = (
      await this.pgService.shoppingCarts.find({
        where: {
          userId: userId,
        },
      })
    ).filter((x) => !(x.productId === null && x.productComboId === null));

    if (restoreInventory) {
      for (const cart of carts) {
        await this.manageInventory(
          cart.municipalityId,
          {
            cartItemType: cart.productId
              ? CartItem.Product
              : CartItem.ProductCombo,
            itemId: cart.productId ? cart.productId : cart.productComboId,
            amount: 0,
          },
          cart.amount,
          userId,
        );
      }
    }

    const result = await this.pgService.shoppingCarts.delete({ userId });

    if (result.affected === 0) {
      throw new NotFoundException(
        `No shopping cart items were deleted for user with ID ${userId}`,
      );
    }

    this.logger.log(
      `Deleted all shopping cart items for user with ID ${userId}`,
    );
  }

  async getCurrentMunicipality(userId: number): Promise<MunicipalityPOutDto> {
    const identityCart = await this.pgService.shoppingCarts.findOne({
      where: {
        userId: userId,
        productId: null,
        productComboId: null,
      },
      relations: ['municipality'],
    });
    if (!identityCart) {
      throw new ConflictException(
        `Municipality for User ${userId} has not been selected`,
      );
    }

    return {
      id: identityCart.municipality.id,
      name: identityCart.municipality.name,
    };
  }

  private async checkInventory(userId: number, municipalityId: number) {
    const carts = (
      await this.pgService.shoppingCarts.find({
        where: {
          userId: userId,
        },
      })
    ).filter((x) => !(x.productId === null && x.productComboId === null));

    for (const cart of carts) {
      await this.manageInventory(
        cart.municipalityId,
        {
          cartItemType:
            cart.productId !== null ? CartItem.Product : CartItem.ProductCombo,
          itemId:
            cart.productId !== null ? cart.productId : cart.productComboId,
          amount: 0,
        },
        cart.amount,
        userId,
      );

      try {
        await this.manageInventory(
          municipalityId,
          {
            cartItemType:
              cart.productId !== null
                ? CartItem.Product
                : CartItem.ProductCombo,
            itemId:
              cart.productId !== null ? cart.productId : cart.productComboId,
            amount: cart.amount,
          },
          0,
          userId,
        );
      } catch (err) {
        this.logger.error(err);
        await this.pgService.shoppingCarts.delete(cart.id);
      }
    }
  }

  public async manageInventory(
    municipalityId: number,
    dto: AddToCartInDto,
    existingAmount: number,
    userId: number,
  ) {
    if (dto.cartItemType === CartItem.Product) {
      await this.manageInventoryEntryProduct(
        municipalityId,
        dto.itemId,
        existingAmount - dto.amount,
      );
    } else {
      const availability =
        await this.availabilityService.getAvailableProductCombosByMunicipality(
          userId,
          {
            page: 1,
            pageSize: 1,
            orderDirection: OrderDirection.ASC,
            orderBy: 'id',
          },
          [dto.itemId],
        );

      if (
        availability.total !== 1 ||
        availability.data[0].inventoryAmount - dto.amount < 0
      ) {
        this.logger.log(`Product Combo with id ${dto.itemId} is exhausted`);
        throw new BadRequestException(
          `Product Combo with id ${dto.itemId} is exhausted`,
        );
      }
      await this.manageInventoryEntryProductCombo(
        municipalityId,
        dto.itemId,
        existingAmount - dto.amount,
      );
    }
  }

  private async manageInventoryEntryProductCombo(
    municipalityId: number,
    productComboId: number,
    amount: number,
  ) {
    const productCombo = await this.pgService.productCombos.findOne({
      where: {
        id: productComboId,
        zone: { municipalities: { id: municipalityId } },
      },
      relations: ['productComboItems'],
    });
    if (productCombo) {
      for (const productComboItem of productCombo.productComboItems) {
        await this.manageInventoryEntryProduct(
          municipalityId,
          productComboItem.productId,
          amount * productComboItem.amount,
        );
      }
    }
  }

  private async manageInventoryEntryProduct(
    municipalityId: number,
    productId: number,
    changeAmount: number,
  ) {
    const inventoryEntry = await this.pgService.inventoryEntries.findOne({
      where: {
        zone: { municipalities: { id: municipalityId } },
        productId,
      },
    });
    if (inventoryEntry && changeAmount + inventoryEntry.quantity >= 0) {
      inventoryEntry.quantity += changeAmount;

      await this.pgService.inventoryEntries.save(inventoryEntry);
    } else {
      this.logger.log(`Product ${productId} is exhausted`);
      throw new BadRequestException(`Product ${productId} is exhausted`);
    }
  }
}
