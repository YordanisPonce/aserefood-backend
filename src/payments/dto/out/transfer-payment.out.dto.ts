import { ApiProperty } from '@nestjs/swagger';

export default class TransferPaymentOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty({nullable: true})
  referencePayment?: string;
}