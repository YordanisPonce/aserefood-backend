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
import { Type } from 'class-transformer';

export default class PromotionInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  description: string;

  @ApiProperty({ enum: DiscountOption })
  @IsNotEmpty()
  @IsEnum(DiscountOption)
  discountOption: DiscountOption;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  discountValue: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  productComboIds?: number[];

  @ApiProperty({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  productIds?: number[];
}
