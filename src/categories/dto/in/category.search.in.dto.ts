import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';

export default class CategorySearchInDto extends PaginatedInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiProperty({required: false, nullable: true})
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsBooleanString()
  isFlat?: boolean;
}