import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export default class ContactInfoUpdateInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  observations?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  identificationNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  municipalityId?: number;
}