import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export default class CategoryInDto{
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

  @ApiProperty({nullable: true})
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}