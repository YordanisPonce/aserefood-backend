import { ApiProperty } from '@nestjs/swagger';

export default class ZelleConfOutDto {
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  qr: string;
}