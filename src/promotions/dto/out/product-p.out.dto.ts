import { ApiProperty } from '@nestjs/swagger';

export default class ProductPOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}