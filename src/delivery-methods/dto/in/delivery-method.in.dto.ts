import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export default class DeliveryMethodInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  estimatedArrivalTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isFree: boolean;

  @ApiProperty({nullable: true})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  pickUpDirection?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minimalDeliveryPrice: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  municipalityId: number;
}