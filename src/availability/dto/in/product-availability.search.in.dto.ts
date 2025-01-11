import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty, IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';
import { Transform } from 'class-transformer';

export default class ProductAvailabilitySearchInDto extends PaginatedInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((val) => parseInt(val, 10))
      : [value].map((val) => parseInt(val, 10)),
  )
  categoryIds?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value == 'true')
  isService?: boolean;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  minimumPrice?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  maximumPrice?: number;
}
