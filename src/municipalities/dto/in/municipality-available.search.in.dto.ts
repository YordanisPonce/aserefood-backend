import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export default class MunicipalityAvailableSearchInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @Min(0)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  provinceId?: number;
}