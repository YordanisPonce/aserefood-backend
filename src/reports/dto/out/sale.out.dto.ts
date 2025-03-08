import { ApiProperty } from '@nestjs/swagger';

export class SaleDetailOutDto{
  @ApiProperty()
  date: Date;

  @ApiProperty()
  amount: number;
}

export default class SaleOutDto{
  @ApiProperty()
  sales: SaleDetailOutDto[];

  @ApiProperty()
  total: number;
}