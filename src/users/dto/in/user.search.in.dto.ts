import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import PaginatedInDto from '../../../utils/dto/in/paginated.in.dto';
import { Role } from '../../../auth/decorators/roles.decorator';

export default class UserSearchInDto extends PaginatedInDto{
  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({required: false})
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Role)
  role?: Role;
}