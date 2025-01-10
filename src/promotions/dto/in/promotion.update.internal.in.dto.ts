import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DiscountOption } from '../../../database/entities/constants';
import { Transform, Type } from 'class-transformer';

export default class PromotionUpdateInternalInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ enum: DiscountOption, required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(DiscountOption)
  @Transform(({ value }) => value !== undefined ? value as DiscountOption : value)
  discountOption?: DiscountOption;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : value)
  discountValue?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value !== undefined ? value == 'true' : value)
  isActive?: boolean;

  @ApiProperty({ type: [Number], nullable: true, required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value !== undefined ? value?.split(',').map(Number) : value)
  productComboIds?: number[];

  @ApiProperty({ type: [Number], nullable: true, required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value !== undefined ? value?.split(',').map(Number) : value)
  productIds?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}