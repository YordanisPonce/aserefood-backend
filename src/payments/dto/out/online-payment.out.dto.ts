import { ApiProperty } from '@nestjs/swagger';

export default class OnlinePaymentOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty({nullable: true})
  paymentCode?: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  address1: string;

  @ApiProperty({nullable: true})
  address2?: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty({nullable: true})
  screenshot?: string;
  
}