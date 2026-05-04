import { OrderStatus } from '../../../database/entities/constants';
import { PaymentSelection } from '../in/order.in.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  productComboId: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  price: number;
}

export default class OrderOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  municipalityId: number;

  @ApiProperty()
  municipalityName: string;

  @ApiProperty()
  contactInfoId: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  createdDate: Date;

  @ApiProperty()
  updatedDate: Date;

  @ApiProperty({ enum: PaymentSelection })
  paymentSelection: PaymentSelection;

  @ApiProperty()
  paymentId: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  deliveryMethodId: number;

  @ApiProperty({ type: [OrderItemOutDto] })
  orderItems: OrderItemOutDto[];
}
