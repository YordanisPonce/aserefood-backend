import { IsDate, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export default class MostDemandedItemInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  quantity?: number;
}