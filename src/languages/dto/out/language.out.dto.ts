import { ApiProperty } from '@nestjs/swagger';

export default class LanguageOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  isActive: boolean;
}