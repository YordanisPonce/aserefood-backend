import { ApiProperty } from '@nestjs/swagger';

export default class ProviderOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}