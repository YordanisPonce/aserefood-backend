import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';

export default class ZoneSearchInDto extends PaginatedInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  provinceId?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  municipalityId?: number;
}