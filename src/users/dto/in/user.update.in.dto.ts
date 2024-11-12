import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../auth/decorators/roles.decorator';

export default class UserUpdateInDto {
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  username?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  role?: Role;


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
  @MaxLength(50)
  lastnames?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, {
    message: 'phoneNumber must contain only digits.',
  })
  phoneNumber?: string;
}