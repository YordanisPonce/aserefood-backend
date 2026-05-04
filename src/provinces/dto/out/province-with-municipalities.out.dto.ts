import { ApiProperty } from '@nestjs/swagger';
import MunicipalityPOutDto from './municipality-p.out.dto';

export default class ProvinceWithMunicipalitiesOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [MunicipalityPOutDto] })
  municipalities: MunicipalityPOutDto[];
}