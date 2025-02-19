import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export default class ZelleScreenshotInDto{
  @ApiProperty({type: 'string', format: 'binary', required: false })
  @IsOptional()
  screenshot?: Express.Multer.File;
}