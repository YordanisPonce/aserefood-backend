import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import ProductComboItemInDto from './product-combo-item.in.dto';

export default class ProductComboUpdateInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @MaxLength(100)
  shortDescription?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  zoneId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [ProductComboItemInDto], required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  productComboItems?: ProductComboItemInDto[];
}