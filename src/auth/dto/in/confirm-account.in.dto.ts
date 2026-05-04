import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class ConfirmAccountInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  confirmationToken: string;
}