import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../auth/decorators/roles.decorator';

export default class LanguageOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  isActive: boolean;
}