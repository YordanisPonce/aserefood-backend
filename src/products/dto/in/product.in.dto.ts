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

export default class ProductInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNotEmpty()
  providerIds: number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isService: boolean;
}