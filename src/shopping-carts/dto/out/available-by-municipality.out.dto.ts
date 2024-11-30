import { ApiProperty } from '@nestjs/swagger';
import ProductOutDto from '../../../products/dto/out/product.out.dto';
import ProductComboOutDto from '../../../product-combos/dto/out/product-combo.out.dto';
import ProductCombo from '../../../database/entities/product-combo.entity';

export class ProductScOutDto {
  @ApiProperty({ type: ProductComboOutDto })
  product: ProductOutDto;

  @ApiProperty()
  inventoryAmount: number;

  @ApiProperty()
  price: number;
}

export class ProductComboScOutDto {
  @ApiProperty({ type: ProductComboOutDto })
  productCombo: ProductComboOutDto;

  @ApiProperty()
  inventoryAmount: number;
}

export default class AvailableItemsByMunicipalityOutDto {
  @ApiProperty({ type: [ProductScOutDto] })
  products: ProductScOutDto[];

  @ApiProperty({ type: [ProductComboScOutDto] })
  productCombos: ProductComboScOutDto[];
}
