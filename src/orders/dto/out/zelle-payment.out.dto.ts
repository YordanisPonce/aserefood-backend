import { ApiProperty } from '@nestjs/swagger';

export default class ZellePaymentOutDto {
  @ApiProperty()
  orderNumber: string

  @ApiProperty()
  phoneNumber: string

  @ApiProperty()
  paymentCode: string

  @ApiProperty()
  transferAmount: number
}