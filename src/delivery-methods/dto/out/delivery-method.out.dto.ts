import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export default class DeliveryMethodOutDto{
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  estimatedArrivalTime: string;

  @ApiProperty()
  isFree: boolean;

  @ApiProperty({nullable: true})
  pickUpDirection?: string;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  minimalDeliveryPrice: number;

  @ApiProperty()
  municipalityId: number;
}