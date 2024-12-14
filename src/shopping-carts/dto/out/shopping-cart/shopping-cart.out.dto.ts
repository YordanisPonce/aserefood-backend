import { ApiProperty } from '@nestjs/swagger';
import ProductOutDto from '../../../../products/dto/out/product.out.dto';
import ProductComboOutDto from '../../../../product-combos/dto/out/product-combo.out.dto';

export class ShoppingCartProductOutDto {
  @ApiProperty({ type: ProductOutDto })
  product: ProductOutDto;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  price: number;
}

export class ShoppingCartProductComboOutDto {
  @ApiProperty({ type: ProductComboOutDto })
  productCombo: ProductComboOutDto;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  price: number;
}

export default class ShoppingCartOutDto {
  @ApiProperty()
  municipalityId: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ type: [ShoppingCartProductOutDto] })
  products: ShoppingCartProductOutDto[];

  @ApiProperty({ type: [ShoppingCartProductComboOutDto] })
  productCombos: ShoppingCartProductComboOutDto[];
}
