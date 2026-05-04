import { Injectable, Logger } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import { ConfigService } from '@nestjs/config';
import ShoppingCartsService from '../services/shopping-carts.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, MoreThan } from 'typeorm';

@Injectable()
export default class AutoDeleteShoppingCartsJob {
  private readonly logger = new Logger(AutoDeleteShoppingCartsJob.name);

  constructor(
    private readonly pgService: PgService,
    private readonly configService: ConfigService,
    private readonly shoppingCartService: ShoppingCartsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async execute() {
    this.logger.log('Executing');

    const maxAllowedHours = this.configService.get<number>(
      'MAX_HOURS_TO_DELETE_SHOPPING_CART',
    );
    const allowedCancellationDate = new Date();
    allowedCancellationDate.setHours(
      allowedCancellationDate.getHours() - maxAllowedHours,
    );

    const carts = (await this.pgService.shoppingCarts.find({
      where: {
        createdDate: LessThan(allowedCancellationDate),
      },
    }))
      .filter(x => !(x.productId === null && x.productComboId === null));

    if (carts.length > 0) {
      this.logger.log(`Found ${carts.length} cart items to cancel.`);

      for (const cart of carts) {
        await this.shoppingCartService.delete(cart.userId, cart.id, true);
      }
    }

    this.logger.log('Finish');
  }
}
