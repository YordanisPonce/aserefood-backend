import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import Order from '../../database/entities/order.entity';
import OrderOutDto from '../dto/out/order.out.dto';
import idFormatter from '../../utils/formatters/id.formatter';
import MailService from '../../mail/services/mail.service';
import OrderInDto, { PaymentSelection } from '../dto/in/order.in.dto';
import ShoppingCartsService from '../../shopping-carts/services/shopping-carts.service';
import { OrderStatus } from '../../database/entities/constants';
import createPatchFields from '../../utils/dto/patch-fields.util';
import OrderUpdateInDto from '../dto/in/order.update.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import OrderSearchInDto from '../dto/in/order.search.in.dto';
import { CartItem } from '../../shopping-carts/dto/in/cart-item.enum';
import OrderMeOutDto, { OrderItemMeOutDto } from '../dto/out/order-me.out.dto';
import Product from '../../database/entities/product.entity';
import ProductOutDto from '../../products/dto/out/product.out.dto';
import ProductCombo from '../../database/entities/product-combo.entity';
import ProductComboOutDto from '../../product-combos/dto/out/product-combo.out.dto';
import generateUniqueCode from '../../utils/generators/unique-code.generator';
import ZellePaymentOutDto from '../dto/out/zelle-payment.out.dto';
import { IsNull, Not } from 'typeorm';
import MinioService from '../../minio/services/minio.service';
 
@Injectable()
export default class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly mailService: MailService,
    private readonly shoppingCartService: ShoppingCartsService,
    private readonly minioService: MinioService,
  ) {}

  async search(dto: OrderSearchInDto): Promise<PaginatedOutDto<OrderOutDto>> {
    const queryBuilder = this.pgService.orders
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('order.municipality', 'municipality');

    // Filtering
    if (dto.status !== undefined && dto.status !== null) {
      queryBuilder.where('order.status = :status', {
        status: dto.status,
      });
    }

    if (dto.code) {
      const codeId = parseInt(dto.code, 10);
      if (codeId) {
        queryBuilder.andWhere('order.id = :codeId', {
          codeId: codeId,
        });
      }
    }

    if (dto.deliveryMethodId) {
      queryBuilder.andWhere('order.deliveryMethodId = :deliveryMethodId', {
        deliveryMethodId: dto.deliveryMethodId,
      });
    }

    if (dto.municipalityId) {
      queryBuilder.andWhere('order.municipalityId = :municipalityId', {
        municipalityId: dto.municipalityId,
      });
    }

    if (dto.userId) {
      queryBuilder.andWhere('order.userId = :userId', {
        userId: dto.userId,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`order.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    return {
      data: result.map((p) => this.toOutDto(p)),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<OrderOutDto[]> {
    const orders = await this.pgService.orders.find({
      relations: ['orderItems', 'municipality'],
    });

    return orders.map((x) => this.toOutDto(x));
  }

  async getByUserId(
    dto: OrderSearchInDto,
    userId: number,
  ): Promise<PaginatedOutDto<OrderMeOutDto>> {
    const queryBuilder = this.pgService.orders
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('order.municipality', 'municipality')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('orderItem.productCombo', 'productCombo')
      .leftJoinAndSelect('productCombo.zone', 'zone')
      .leftJoinAndSelect('zone.inventoryEntries', 'inventoryEntry')
      .leftJoinAndSelect('productCombo.productComboItems', 'productComboItem')
      .leftJoinAndSelect('productComboItem.product', 'productComboItemProduct')
      .where('order.userId = :userId', { userId: userId });

    // Filtering
    if (dto.status !== undefined && dto.status !== null) {
      queryBuilder.andWhere('order.status = :status', {
        status: dto.status,
      });
    }

    if (dto.code) {
      const codeId = parseInt(dto.code, 10);
      if (codeId) {
        queryBuilder.andWhere('order.id = :codeId', {
          codeId: codeId,
        });
      }
    }

    if (dto.deliveryMethodId) {
      queryBuilder.andWhere('order.deliveryMethodId = :deliveryMethodId', {
        deliveryMethodId: dto.deliveryMethodId,
      });
    }

    if (dto.municipalityId) {
      queryBuilder.andWhere('order.municipalityId = :municipalityId', {
        municipalityId: dto.municipalityId,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`order.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const data: OrderMeOutDto[] = []
    for (const item of result) {
      data.push(await this.toOutMeDto(item));
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

  async getByIdAndUserId(id: number, userId: number): Promise<OrderMeOutDto> {
    const user = await this.pgService.users.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const order = await this.pgService.orders.findOne({
      where: { userId, id },
      relations: [
        'orderItems',
        'municipality',
        'orderItems.product.categories',
        'orderItems.productCombo.zone.inventoryEntries',
        'orderItems.productCombo.productComboItems.product',
      ],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with id ${id} of User ${userId} not found`,
      );
    }

    return this.toOutMeDto(order);
  }

  async getById(id: number): Promise<OrderOutDto> {
    const order = await this.pgService.orders.findOne({
      where: { id },
      relations: ['orderItems', 'municipality'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.toOutDto(order);
  }

  async updateOrderZelle(id: number, userId: number) {
    const order = await this.pgService.orders.findOne({
      where: { id, userId, onlinePayment: Not(IsNull()) },
      relations: ['onlinePayment'],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} and User ${userId} not found`,
      );
    }

    if (order.status == OrderStatus.PAYMENT_PENDING){
      order.status = OrderStatus.PROCESSING_PAYMENT;
      await this.pgService.orders.save(order);
    }
  }

  async getZellePayment(
    id: number,
    userId: number,
  ): Promise<ZellePaymentOutDto> {
    const order = await this.pgService.orders.findOne({
      where: { id, userId, onlinePayment: Not(IsNull()) },
      relations: ['onlinePayment'],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} and User ${userId} not found`,
      );
    }

    const zelleList = await this.pgService.zelleConfs.find({ take: 1 });
    const zelle = zelleList[0];
    const qrUrl = await this.minioService.getPresignedUrl(zelle.qr);

    return {
      transferAmount: order.totalAmount,
      orderNumber: idFormatter(order.id),
      paymentCode: order.onlinePayment.paymentCode,
      phoneNumber: zelle?.phoneNumber ?? '',
      qr: qrUrl,
    };
  }

  public async post(userId: number, dto: OrderInDto): Promise<OrderOutDto> {
    const user = await this.pgService.users.findOneBy({
      id: userId,
      isActive: true,
      isConfirmed: true,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }

    const shoppingCart =
      await this.shoppingCartService.getAllShoppingCart(userId);
    if (
      !shoppingCart ||
      (shoppingCart.products.length === 0 &&
        shoppingCart.productCombos.length === 0)
    ) {
      throw new ConflictException(
        `User with id ${userId} does not have a shopping cart`,
      );
    }

    const identityCart = await this.pgService.shoppingCarts.findOne({
      where: {
        userId: userId,
        productId: null,
        productComboId: null,
      },
    });

    const deliveryMethod = await this.pgService.deliveryMethods.findOneBy({
      id: dto.deliveryMethodId,
    });
    if (!deliveryMethod) {
      throw new NotFoundException(
        `Delivery Method with id ${userId} does not exist`,
      );
    }

    const contactInfo = await this.pgService.contactInfos.findOneBy({
      id: dto.contactInfoId,
    });
    if (!contactInfo) {
      throw new NotFoundException(
        `Contact Info with id ${userId} does not exist`,
      );
    }

    const newOrder = this.pgService.orders.create({
      userId: userId,
      status: OrderStatus.PAYMENT_PENDING,
      deliveryMethodId: dto.deliveryMethodId,
      contactInfoId: dto.contactInfoId,
      totalAmount: shoppingCart.totalPrice,
      transferPayment: null,
      onlinePayment: null,
      municipalityId: identityCart.municipalityId,
      orderItems: shoppingCart.products
        .map((x) => ({
          productComboId: null,
          productId: x.product.id,
          amount: x.amount,
          price: x.price,
        }))
        .concat(
          shoppingCart.productCombos.map((x) => ({
            amount: x.amount,
            productComboId: x.productCombo.id,
            productId: null,
            price: x.price,
          })),
        ),
    });

    await this.pgService.orders.save(newOrder);

    if (dto.paymentSelection === PaymentSelection.Online) {
      const onlinePayment = this.pgService.onlinePayments.create({
        orderId: newOrder.id,
        address1: dto.onlinePaymentDto.address1,
        address2: dto.onlinePaymentDto.address2,
        city: dto.onlinePaymentDto.city,
        country: dto.onlinePaymentDto.country,
        email: dto.onlinePaymentDto.email,
        firstName: dto.onlinePaymentDto.firstName,
        lastName: dto.onlinePaymentDto.lastName,
        phoneNumber: dto.onlinePaymentDto.phoneNumber,
        postalCode: dto.onlinePaymentDto.postalCode,
        state: dto.onlinePaymentDto.state,
        paymentCode: generateUniqueCode(6),
      });

      await this.pgService.onlinePayments.save(onlinePayment);
      newOrder.onlinePaymentId = onlinePayment.id;
      newOrder.status = OrderStatus.PAYMENT_PENDING;

      await this.mailService.sendPaidOrderEmail(
        user.email,
        user.username,
        newOrder.id,
        shoppingCart.totalPrice,
        'USD',
        newOrder.createdDate,
        contactInfo.phoneNumber,
        deliveryMethod.pickUpDirection,
        'Pago Creado',
      );
    } else {
      const transferPayment = this.pgService.transferPayments.create({
        orderId: newOrder.id,
        referencePayment: generateUniqueCode(6),
      });
      await this.pgService.transferPayments.save(transferPayment);
      newOrder.transferPaymentId = transferPayment.id;
    }

    await this.pgService.orders.save(newOrder);

    await this.shoppingCartService.deleteAll(userId, false);

    await this.mailService.sendPendingOrderEmail(
      user.email,
      user.username,
      newOrder.id,
      newOrder.totalAmount,
      'USD',
      36,
      newOrder.createdDate,
    );

    this.logger.log(
      `Created new Order with id ${newOrder.id} for user ${user.id}`,
    );

    return this.toOutDto(newOrder);
  }

  async patch(id: number, dto: OrderUpdateInDto): Promise<void> {
    const order = await this.pgService.orders.findOne({
      where: {
        id: id,
      },
      relations: ['user', 'orderItems', 'contactInfo', 'deliveryMethod'],
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} does not exist`);
    }

    if (dto.status) {
      if (
        order.status === OrderStatus.CANCELLED &&
        dto.status !== order.status
      ) {
        throw new ConflictException(`Order with id ${id} was canceled`);
      }

      if (dto.status !== order.status) {
        if (dto.status === OrderStatus.CANCELLED) {
          for (const orderItem of order.orderItems) {
            await this.shoppingCartService.manageInventory(
              order.municipalityId,
              {
                cartItemType:
                  orderItem.productId !== null
                    ? CartItem.Product
                    : CartItem.ProductCombo,
                itemId:
                  orderItem.productId !== null
                    ? orderItem.productId
                    : orderItem.productComboId,
                amount: 0,
              },
              orderItem.amount,
              order.userId,
            );
          }

          await this.mailService.sendCancelledOrderEmail(
            order.user.email,
            order.user.username,
            order.id,
            'Cancelación Manual',
          );
        } else if (dto.status === OrderStatus.PAYED) {
          await this.mailService.sendPaidOrderEmail(
            order.user.email,
            order.user.username,
            order.id,
            order.totalAmount,
            'USD',
            order.createdDate,
            order.contactInfo.phoneNumber,
            order.deliveryMethod.pickUpDirection,
            'STATEMENT',
          );
        }
      }
    }

    await this.pgService.orders.update(id, createPatchFields(dto));
    this.logger.log(`Updated order with ID ${id}`);
    this.logger.log({ ...dto });
  }

  async delete(id: number): Promise<void> {
    const result = await this.pgService.orders.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    this.logger.log(`Deleted order with ID ${id}`);
  }

  private async toOutMeDto(order: Order): Promise<OrderMeOutDto> {
    const dto = new OrderMeOutDto();
    dto.id = order.id;
    dto.code = idFormatter(order.id);
    dto.status = order.status;
    dto.createdDate = order.createdDate;
    dto.updatedDate = order.updatedDate;
    dto.contactInfoId = order.contactInfoId;
    dto.totalAmount = order.totalAmount;
    dto.municipalityId = order.municipalityId;
    dto.municipalityName = order.municipality?.name ?? '';
    dto.paymentSelection =
      order.onlinePayment !== null
        ? PaymentSelection.Online
        : PaymentSelection.Transfer;
    dto.paymentId = order.onlinePayment !== null
      ? order.onlinePaymentId
      : order.transferPaymentId;
    dto.deliveryMethodId = order.deliveryMethodId;

    const data: OrderItemMeOutDto[] = []
    for (const item of (order.orderItems ? order.orderItems : [])) {
      data.push({
        id: item.id,
        product: item.productId ? await this.productToOutDto(item.product) : null,
        productCombo: item.productComboId
          ? await this.productComboToOutDto(item.productCombo)
          : null,
        amount: item.amount,
        price: parseFloat(item.price.toString()),
      });
    }
    dto.orderItems = data;

    return dto;
  }

  private toOutDto(order: Order): OrderOutDto {
    const dto = new OrderOutDto();
    dto.id = order.id;
    dto.code = idFormatter(order.id);
    dto.status = order.status;
    dto.createdDate = order.createdDate;
    dto.updatedDate = order.updatedDate;
    dto.contactInfoId = order.contactInfoId;
    dto.totalAmount = order.totalAmount;
    dto.municipalityId = order.municipalityId;
    dto.municipalityName = order.municipality?.name ?? '';
    dto.paymentSelection =
      order.onlinePayment !== null
        ? PaymentSelection.Online
        : PaymentSelection.Transfer;
    dto.paymentId = order.onlinePayment !== null
      ? order.onlinePaymentId
      : order.transferPaymentId;
    dto.orderItems =
      order.orderItems?.map((x) => ({
        id: x.id,
        productId: x.productId,
        productComboId: x.productComboId,
        amount: x.amount,
        price: parseFloat(x.price.toString()),
      })) ?? [];
    dto.deliveryMethodId = order.deliveryMethodId;

    return dto;
  }

  private async productToOutDto(product: Product): Promise<ProductOutDto> {
    const dto = new ProductOutDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.shortDescription = product.shortDescription;
    dto.isService = product.isService;
    dto.categories = product.categories?.map(x => ({
      id: x.id,
      name: x.name,
    })) ?? [];
    dto.image = product.image ? await this.minioService.getPresignedUrl(product.image) : null;

    return dto;
  }

  private async productComboToOutDto(productCombo: ProductCombo): Promise<ProductComboOutDto> {
    const dto = new ProductComboOutDto();
    dto.id = productCombo.id;
    dto.description = productCombo.description;
    dto.name = productCombo.name;
    dto.image = productCombo.image ? await this.minioService.getPresignedUrl(productCombo.image) : null;
    dto.isActive = productCombo.isActive;
    dto.price = parseFloat(productCombo.price.toString());
    dto.shortDescription = productCombo.shortDescription;
    dto.zoneId = productCombo.zoneId;
    dto.zoneName = productCombo.zone?.name ?? '';
    dto.referencePrice = productCombo.zone
      ? productCombo.productComboItems.reduce(
          (a, b) =>
            a +
            b.amount *
              productCombo.zone.inventoryEntries
                .filter((e) => e.productId === b.productId)
                .reduce((y, z) => y + parseFloat(z.price.toString()), 0),
          0,
        )
      : -1;
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
