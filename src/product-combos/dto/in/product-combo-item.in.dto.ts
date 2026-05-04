import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export default class ProductComboItemInDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  productId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  amount: number;
}