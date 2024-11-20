import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export default class ZoneUpdateInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({nullable: true, required: false})
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({type: [Number], required: false})
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  municipalityIds: number[];
}