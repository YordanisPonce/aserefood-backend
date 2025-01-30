import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import ContactInfoSearchInDto from './contact-info.search.in.dto';

export default class ContactInfoBackofficeSearchInDto extends ContactInfoSearchInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value !== undefined ? value === 'true' : value)
  isActive?: boolean;
}