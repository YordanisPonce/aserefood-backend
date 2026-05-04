import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';
import { Transform } from 'class-transformer';

export default class ProductSearchInDto extends PaginatedInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  providerId?: number;

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
  @IsBooleanString()
  isService?: boolean;
}
