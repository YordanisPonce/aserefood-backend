import { ApiProperty } from '@nestjs/swagger';

export default class MostDemandedItemOutDto{
  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;
}