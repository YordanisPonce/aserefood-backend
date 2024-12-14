import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { CartItem } from './cart-item.enum';

export default class AddToCartInDto {
  @ApiProperty({ enum: CartItem })
  @IsNotEmpty()
  @IsEnum(CartItem)
  cartItemType: CartItem;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  itemId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;
}
