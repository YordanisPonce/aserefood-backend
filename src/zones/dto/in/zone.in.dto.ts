import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export default class ZoneInDto{
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({nullable: true})
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({type: [Number]})
  @IsArray()
  @IsNotEmpty()
  municipalityIds: number[];
}