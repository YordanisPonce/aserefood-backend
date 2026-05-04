import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import MailService from '../../mail/services/mail.service';
import TransferPayment from '../../database/entities/transfer-payment.entity';
import TransferPaymentOutDto from '../dto/out/transfer-payment.out.dto';

@Injectable()
export default class TransferPaymentsService {
  private readonly logger = new Logger(TransferPaymentsService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly mailService: MailService,
  ) {}

  async getPaymentByOrderId(orderId: number): Promise<TransferPaymentOutDto> {
    const order = await this.pgService.orders.findOne({where: {id: orderId}});
    if(!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
    if(!order.transferPaymentId){
      throw new BadRequestException(`Order with id ${orderId} has no transfer payment`);
    }

    return this.getPaymentById(order.transferPaymentId);
  }

  async getPaymentById(id: number): Promise<TransferPaymentOutDto>{
    const payment = await this.pgService.transferPayments.findOne({where: {id: id}});
    if(!payment) {
      throw new NotFoundException(`Transfer Payment with id ${id} not found`);
    }

    return this.mapToDto(payment);
  }

  private async mapToDto(payment: TransferPayment): Promise<TransferPaymentOutDto> {
    const dto = new TransferPaymentOutDto();
    dto.orderId = payment.orderId;
    dto.id = payment.id;
    dto.referencePayment = payment.referencePayment;
    return dto;
  }
}