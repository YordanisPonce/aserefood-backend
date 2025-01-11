import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export default class ProductUpdateInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription?: string;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value !== undefined ? value?.split(',').map(Number) : value)
  categoryIds?: number[];

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value !== undefined ? value?.split(',').map(Number) : value)
  providerIds?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value !== undefined ? value == 'true' : value)
  isService?: boolean;
}