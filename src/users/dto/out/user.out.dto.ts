import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../auth/decorators/roles.decorator';

export default class UserOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastnames: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isConfirmed: boolean;

  @ApiProperty()
  phoneNumber: string;
}