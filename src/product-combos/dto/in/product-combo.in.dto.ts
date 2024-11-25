import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import ProductComboItemInDto from './product-combo-item.in.dto';

export default class ProductComboInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  price: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  zoneId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: [ProductComboItemInDto] })
  @IsArray()
  @IsNotEmpty()
  productComboItems: ProductComboItemInDto[];
}
