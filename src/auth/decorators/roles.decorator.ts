import { SetMetadata } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';


export enum Role{
  Customer = 'customer',
  Admin = 'admin',
  SuperAdmin = 'superadmin'
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);