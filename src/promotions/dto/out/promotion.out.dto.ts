import { ApiProperty } from '@nestjs/swagger';
import { DiscountOption } from '../../../database/entities/constants';
import ProductComboPOutDto from './product-combo-p.out.dto';
import ProductPOutDto from './product-p.out.dto';

export default class PromotionOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: DiscountOption })
  discountOption: DiscountOption;

  @ApiProperty()
  discountValue: number;

  @ApiProperty({ nullable: true })
  image?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [ProductComboPOutDto] })
  productCombos: ProductComboPOutDto[];

  @ApiProperty({ type: [ProductPOutDto] })
  products: ProductPOutDto[];

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;
}