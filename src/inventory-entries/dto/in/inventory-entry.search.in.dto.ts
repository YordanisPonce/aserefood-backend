import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';

export default class InventoryEntrySearchInDto extends PaginatedInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  zoneId?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  productId?: number;
}