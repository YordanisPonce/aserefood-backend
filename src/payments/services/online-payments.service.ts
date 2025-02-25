import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import OnlinePayment from '../../database/entities/online-payment.entity';
import OnlinePaymentOutDto from '../dto/out/online-payment.out.dto';
import MinioService from '../../minio/services/minio.service';
import { Role } from '../../auth/decorators/roles.decorator';

@Injectable()
export default class OnlinePaymentsService {
  private readonly logger = new Logger(OnlinePaymentsService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly minioService: MinioService,
  ) {}

  async getPaymentByOrderId(
    orderId: number,
    userId: number,
  ): Promise<OnlinePaymentOutDto> {
    const order = await this.pgService.orders.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
    if (!order.onlinePaymentId) {
      throw new BadRequestException(
        `Order with id ${orderId} has no online payment`,
      );
    }

    return this.getPaymentById(order.onlinePaymentId, userId);
  }

  async getPaymentById(
    id: number,
    userId: number,
  ): Promise<OnlinePaymentOutDto> {
    const user = await this.pgService.users.findOne({ where: { id: userId } });
    const payment = await this.pgService.onlinePayments.findOne({
      where: { id: id },
      relations: ['order'],
    });
    if (user.role === Role.Customer && payment.order.userId !== userId) {
      throw new NotFoundException(`Online Payment with id ${id} not found for current user`)
    }
      if (!payment) {
        throw new NotFoundException(`Online Payment with id ${id} not found`);
      }

    return this.mapToDto(payment);
  }

  private async mapToDto(payment: OnlinePayment): Promise<OnlinePaymentOutDto> {
    const dto = new OnlinePaymentOutDto();
    dto.id = payment.id;
    dto.orderId = payment.orderId;
    dto.paymentCode = payment.paymentCode;
    dto.city = payment.city;
    dto.address1 = payment.address1;
    dto.address2 = payment.address2;
    dto.country = payment.country;
    dto.email = payment.email;
    dto.firstName = payment.firstName;
    dto.lastName = payment.lastName;
    dto.phoneNumber = payment.phoneNumber;
    dto.postalCode = payment.postalCode;
    dto.state = payment.state;
    dto.screenshot = payment.screenshot
      ? await this.minioService.getPresignedUrl(payment.screenshot)
      : null;
    return dto;
  }
}