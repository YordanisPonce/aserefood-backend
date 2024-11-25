import { ApiProperty } from '@nestjs/swagger';
import MunicipalityOutDto from '../../../municipalities/dto/out/municipality.out.dto';

export default class ContactInfoWithMunicipalityOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ nullable: true })
  observations?: string;

  @ApiProperty({ nullable: true })
  identificationNumber?: string;

  @ApiProperty({ type: MunicipalityOutDto })
  municipality: MunicipalityOutDto;

  @ApiProperty()
  userId: number;
}
