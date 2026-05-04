import { ApiProperty } from '@nestjs/swagger';

export default class ContactInfoOutDto {
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

  @ApiProperty()
  municipalityId: number;

  @ApiProperty()
  userId: number;
}