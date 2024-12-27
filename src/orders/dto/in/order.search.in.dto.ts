import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional, IsString, MaxLength,
  Min,
} from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';
import { Transform } from 'class-transformer';
import { OrderStatus } from '../../../database/entities/constants';

export default class OrderSearchInDto extends PaginatedInDto {
  @ApiProperty({required: false, enum: OrderStatus})
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  @Transform(({value}) => parseInt(value, 10))
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  deliveryMethodId?: number;

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
  userId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(12)
  code?: string;
}
