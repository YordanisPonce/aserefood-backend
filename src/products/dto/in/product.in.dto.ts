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

export default class ProductInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value?.split(',').map(Number))
  categoryIds: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value?.split(',').map(Number))
  providerIds: number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value == 'true')
  isService: boolean;
}