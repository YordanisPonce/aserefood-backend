import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../decorators/roles.decorator';

export default class CustomerOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastNames: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isConfirmed: boolean;
}