import { ApiProperty } from '@nestjs/swagger';
import ProductOutDto from '../../../products/dto/out/product.out.dto';

export class ProductAvailableByZoneOutDto {
  @ApiProperty({ type: ProductOutDto })
  product: ProductOutDto;

  @ApiProperty()
  inventoryAmount: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isAvailable: boolean;
}