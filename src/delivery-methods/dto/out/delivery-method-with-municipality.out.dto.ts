import { ApiProperty } from '@nestjs/swagger';
import MunicipalityOutDto from '../../../municipalities/dto/out/municipality.out.dto';

export default class DeliveryMethodWithMunicipalityOutDto{
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
  municipality: MunicipalityOutDto;
}