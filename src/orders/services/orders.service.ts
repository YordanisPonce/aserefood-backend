import {
  BadRequestException,
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
import { CartItem } from '../../shopping-carts/dto/in/shopping-cart/cart-item.enum';

@Injectable()
export default class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly mailService: MailService,
    private readonly shoppingCartService: ShoppingCartsService,
  ) {}

  async search(
    dto: OrderSearchInDto,
  ): Promise<PaginatedOutDto<OrderOutDto>> {
    const queryBuilder =
      this.pgService.orders
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItem');

    // Filtering
    if (dto.status !== undefined && dto.status !== null) {
      queryBuilder.where('order.status = :status', {
        status: dto.status,
      });
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
      data:  result.map((p) => this.toOutDto(p)),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getAll(): Promise<OrderOutDto[]> {
    const orders = await this.pgService.orders.find({
      relations: ['orderItems'],
    });

    return orders.map((x) => this.toOutDto(x));
  }

  async getByUserId(userId: number): Promise<OrderOutDto[]> {
    const user = await this.pgService.users.findOneBy({id: userId});
    if(!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const orders = await this.pgService.orders.find({
      where: { userId },
      relations: ['orderItems'],
    });

    return orders.map(x => this.toOutDto(x));
  }

  async getById(id: number): Promise<OrderOutDto> {
    const order = await this.pgService.orders.findOne({
      where: { id },
      relations: ['orderItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.toOutDto(order);
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
        }))
        .concat(
          shoppingCart.productCombos.map((x) => ({
            amount: x.amount,
            productComboId: x.productCombo.id,
            productId: null,
          })),
        ),
    });

    await this.pgService.orders.save(newOrder);

    if (dto.paymentSelection === PaymentSelection.Online) {
      // ToDo: Implement Payment in TropyPay

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
      });

      await this.pgService.onlinePayments.save(onlinePayment);
      newOrder.onlinePaymentId = onlinePayment.id;
      newOrder.status = OrderStatus.PAYED;

      await this.mailService.sendPaidOrderEmail(
        user.email,
        user.username,
        newOrder.id,
        shoppingCart.totalPrice,
        'CUP',
        newOrder.createdDate,
        contactInfo.phoneNumber,
        deliveryMethod.pickUpDirection,
        'FUNCIONÓ ESTO',
      );
    } else {
      const transferPayment = this.pgService.transferPayments.create({
        orderId: newOrder.id,
        referencePayment: null,
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
      'CUP',
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
      relations: ['user', 'orderItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} does not exist`);
    }

    if (dto.status) {
      if (order.status === OrderStatus.CANCELLED && dto.status !== order.status) {
        throw new ConflictException(`Order with id ${id} was canceled`);
      }

      if (dto.status !== order.status && dto.status === OrderStatus.CANCELLED) {
        for(const orderItem of order.orderItems){
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
    dto.paymentSelection =
      order.onlinePayment !== null
        ? PaymentSelection.Online
        : PaymentSelection.Transfer;
    dto.orderItems =
      order.orderItems?.map((x) => ({
        id: x.id,
        productId: x.productId,
        productComboId: x.productComboId,
        amount: x.amount,
      })) ?? [];

    return dto;
  }
}
