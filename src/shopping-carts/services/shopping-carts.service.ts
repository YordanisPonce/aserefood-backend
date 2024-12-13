import { Injectable, Logger } from '@nestjs/common';
import PgService from '../../database/services/pg.service';

@Injectable()
export default class ShoppingCartsService {
  private readonly logger = new Logger(ShoppingCartsService.name);

  constructor(private readonly pgService: PgService) {}
}
