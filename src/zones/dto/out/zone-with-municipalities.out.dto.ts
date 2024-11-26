import { ApiProperty } from '@nestjs/swagger';
import MunicipalityOutDto from '../../../municipalities/dto/out/municipality.out.dto';

export default class ZoneWithMunicipalitiesOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ type: [MunicipalityOutDto] })
  municipalities: MunicipalityOutDto[];
}