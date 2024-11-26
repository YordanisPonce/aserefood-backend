import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export default class CurrencyInDto {
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
  @IsBoolean()
  isBaseCurrency: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0.000001)
  exchangeRate: number;
}
