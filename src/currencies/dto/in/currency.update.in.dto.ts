import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty, IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength, Min,
  MinLength,
} from 'class-validator';
import { Role } from '../../../auth/decorators/roles.decorator';

export default class CurrencyUpdateInDto {
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isBaseCurrency?: boolean;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  exchangeRate?: number;
}