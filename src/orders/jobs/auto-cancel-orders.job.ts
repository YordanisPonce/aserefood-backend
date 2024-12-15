import { Injectable, Logger } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import MailService from '../../mail/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus } from '../../database/entities/constants';
import ShoppingCartsService from '../../shopping-carts/services/shopping-carts.service';
import { CartItem } from '../../shopping-carts/dto/in/shopping-cart/cart-item.enum';

@Injectable()
export default class AutoCancelOrdersJob {
  private readonly logger = new Logger(AutoCancelOrdersJob.name);

  constructor(
    private readonly pgService: PgService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly shoppingCartService: ShoppingCartsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async execute() {
    this.logger.log('Executing');

    const maxAllowedHours = this.configService.get<number>(
      'MAX_HOURS_TO_AUTO_CANCEL_ORDER',
    );

    const orders = await this.pgService.orders.find({
      where: [
        { status: OrderStatus.PAYMENT_PENDING },
        { status: OrderStatus.PROCESSING_PAYMENT },
      ],
      relations: ['user', 'orderItems'],
    });

    const ordersToCancel = orders.filter((order) => {
      const allowedCancellationDate = new Date(order.updatedDate);
      allowedCancellationDate.setHours(
        allowedCancellationDate.getHours() + maxAllowedHours,
      );
      return new Date() >= allowedCancellationDate;
    });

    if (ordersToCancel.length > 0) {
      this.logger.log(`Found ${ordersToCancel.length} orders to cancel.`);

      for (const order of ordersToCancel) {
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

        order.status = OrderStatus.CANCELLED;
        await this.pgService.orders.save(order);

        await this.mailService.sendCancelledOrderEmail(
          order.user.email,
          order.user.username,
          order.id,
          'Cancelación Automática',
        );

        this.logger.log(`Order ${order.id} cancelled successfully.`);
      }
    }

    this.logger.log('Finish');
  }
}
