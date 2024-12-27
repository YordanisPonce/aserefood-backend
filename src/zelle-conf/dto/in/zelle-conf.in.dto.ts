import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export default class ZelleConfInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  qr: string;
}