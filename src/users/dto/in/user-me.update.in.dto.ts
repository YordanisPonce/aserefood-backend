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
} from 'class-validator';
import { Role } from '../../../auth/decorators/roles.decorator';
import { Transform } from 'class-transformer';

export default class UserMeUpdateInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  @Transform(({ value }) => value !== undefined ? value as Role : value)
  role?: Role;

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
  lastnames?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value !== undefined ? value == 'true' : value)
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, {
    message: 'phoneNumber must contain only digits.',
  })
  phoneNumber?: string;

  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: Express.Multer.File;
}