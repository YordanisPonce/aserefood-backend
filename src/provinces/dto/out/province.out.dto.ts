import { ApiProperty } from '@nestjs/swagger';

export default class ProvinceOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}