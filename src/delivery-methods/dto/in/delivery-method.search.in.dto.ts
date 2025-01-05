import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';
import { Transform } from 'class-transformer';

export default class DeliveryMethodSearchInDto extends PaginatedInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value == 'true')
  isFree?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  municipalityId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  provinceId?: number;
}