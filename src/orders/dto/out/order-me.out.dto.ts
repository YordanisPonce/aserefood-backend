import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../database/entities/constants';
import { PaymentSelection } from '../in/order.in.dto';
import ProductOutDto from '../../../products/dto/out/product.out.dto';
import ProductComboOutDto from '../../../product-combos/dto/out/product-combo.out.dto';

export class OrderItemMeOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty({nullable: true})
  product?: ProductOutDto;

  @ApiProperty({nullable: true})
  productCombo?: ProductComboOutDto;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  price: number;
}

export default class OrderMeOutDto {
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
  totalAmount: number;

  @ApiProperty()
  deliveryMethodId: number;

  @ApiProperty({ type: [OrderItemMeOutDto] })
  orderItems: OrderItemMeOutDto[];
}
