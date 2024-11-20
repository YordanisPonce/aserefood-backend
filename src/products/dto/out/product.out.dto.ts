import { ApiProperty } from '@nestjs/swagger';
import ProviderOutDto from '../../../providers/dto/out/provider.out.dto';

export default class ProductOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  isService: boolean;
}