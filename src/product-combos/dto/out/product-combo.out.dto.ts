import { ApiProperty } from '@nestjs/swagger';
import ProductComboItemOutDto from './product-combo-item.out.dto';

export default class ProductComboOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ nullable: true })
  image?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  referencePrice: number;

  @ApiProperty()
  zoneId: number;

  @ApiProperty()
  zoneName: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [ProductComboItemOutDto] })
  productComboItems: ProductComboItemOutDto[];
}