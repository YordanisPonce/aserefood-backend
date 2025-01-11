import { ApiProperty } from '@nestjs/swagger';
import ProviderOutDto from '../../../providers/dto/out/provider.out.dto';
import { CategoryProductOutDto } from './product.out.dto';

export default class ProductWithProvidersOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  image?: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [CategoryProductOutDto] })
  categories: CategoryProductOutDto[];

  @ApiProperty()
  isService: boolean;

  @ApiProperty({ type: [ProviderOutDto] })
  providers: ProviderOutDto[];
}