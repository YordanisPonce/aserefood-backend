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
  @Transform(({ value }) => parseInt(value) as DiscountOption)
  discountOption: DiscountOption;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  @Transform(({ value }) => parseFloat(value))
  discountValue: number;

  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;

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
  @Transform(({ value }) => value == 'true')
  isActive: boolean;

  @ApiProperty({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value?.split(',').map(Number))
  productComboIds?: number[];

  @ApiProperty({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value?.split(',').map(Number))
  productIds?: number[];
}
