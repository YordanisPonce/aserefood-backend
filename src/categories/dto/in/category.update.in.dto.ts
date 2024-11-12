import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export default class CategoryUpdateInDto {
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({required: false, nullable: true})
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({required: false, nullable: true})
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}