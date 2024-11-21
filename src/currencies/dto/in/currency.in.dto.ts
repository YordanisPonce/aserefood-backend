import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty, IsNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Role } from '../../../auth/decorators/roles.decorator';

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
