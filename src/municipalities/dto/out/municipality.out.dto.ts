import { ApiProperty } from '@nestjs/swagger';

export default class MunicipalityOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  provinceId: number;

  @ApiProperty()
  provinceName: string;
}