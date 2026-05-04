import { ApiProperty } from '@nestjs/swagger';

export default class MunicipalityPOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}