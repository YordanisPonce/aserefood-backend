import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, IsNumber, Min } from 'class-validator';

export default class InventoryEntryUpdateInDto{
  @ApiProperty()
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  price: number;
}