import { ApiProperty } from '@nestjs/swagger';
import ProductComboOutDto from '../../../../product-combos/dto/out/product-combo.out.dto';

export class ProductComboAvailableByMunicipalityOutDto {
  @ApiProperty({ type: ProductComboOutDto })
  productCombo: ProductComboOutDto;

  @ApiProperty()
  inventoryAmount: number;

  @ApiProperty()
  price: number;
}
