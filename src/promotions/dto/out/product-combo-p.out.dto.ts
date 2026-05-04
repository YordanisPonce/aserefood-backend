import { ApiProperty } from '@nestjs/swagger';

export default class ProductComboPOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}