import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class RefreshInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}