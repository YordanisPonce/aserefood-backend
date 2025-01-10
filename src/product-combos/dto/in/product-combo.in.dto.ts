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
import { Transform } from 'class-transformer';

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

  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  zoneId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value == 'true')
  isActive: boolean;

  @ApiProperty({ type: [ProductComboItemInDto] })
  @IsArray()
  @IsNotEmpty()
  productComboItems: ProductComboItemInDto[];
}
