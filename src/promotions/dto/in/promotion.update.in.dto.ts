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

export default class PromotionUpdateInDto {
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
  discountOption?: DiscountOption;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  discountValue?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [Number], nullable: true, required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  productComboIds?: number[];

  @ApiProperty({ type: [Number], nullable: true, required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  productIds?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  endDate?: Date;
}