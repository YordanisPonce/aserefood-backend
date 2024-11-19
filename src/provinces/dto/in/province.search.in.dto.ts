import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';

export default class ProvinceSearchInDto extends PaginatedInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;
}