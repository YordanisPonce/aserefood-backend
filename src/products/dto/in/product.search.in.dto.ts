import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';

export default class ProductSearchInDto extends PaginatedInDto{
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
  providerId?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  categoryId?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsBooleanString()
  isService?: boolean;
}