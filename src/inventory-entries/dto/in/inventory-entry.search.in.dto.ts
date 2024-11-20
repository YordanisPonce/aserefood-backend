import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';
import { Transform } from 'class-transformer';

export default class InventoryEntrySearchInDto extends PaginatedInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  zoneId?: number;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  productId?: number;
}