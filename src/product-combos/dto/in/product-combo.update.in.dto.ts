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
import { Transform } from 'class-transformer';

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

  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : value)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }) => value !== undefined ? parseInt(value, 10) : value)
  zoneId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value !== undefined ? value == 'true' : value)
  isActive?: boolean;

  @ApiProperty({ type: [ProductComboItemInDto], required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  productComboItems?: ProductComboItemInDto[];
}