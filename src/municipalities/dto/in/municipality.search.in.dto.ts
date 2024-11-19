import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';

export default class MunicipalitySearchInDto extends PaginatedInDto{
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
  provinceId: number;
}