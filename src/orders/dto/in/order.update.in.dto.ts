import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { OrderStatus } from '../../../database/entities/constants';

export default class OrderUpdateInDto {
  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}