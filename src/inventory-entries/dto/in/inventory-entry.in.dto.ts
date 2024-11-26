import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export default class InventoryEntryInDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  price: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  productId: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  zoneId: number;
}