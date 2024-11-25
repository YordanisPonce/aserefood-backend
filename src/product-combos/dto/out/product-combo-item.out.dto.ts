import { ApiProperty } from '@nestjs/swagger';

export default class ProductComboItemOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  amount: number;
}