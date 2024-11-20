import { ApiProperty } from '@nestjs/swagger';

export default class InventoryEntryOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  zoneId: number;

  @ApiProperty()
  zoneName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}