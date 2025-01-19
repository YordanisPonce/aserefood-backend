import { ApiProperty } from '@nestjs/swagger';

export default class ItemIdOutDto{
  @ApiProperty()
  id: number;
}