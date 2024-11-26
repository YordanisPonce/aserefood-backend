import { ApiProperty } from '@nestjs/swagger';

export default class ZoneOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description?: string;
}