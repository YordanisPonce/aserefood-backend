import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../database/entities/constants';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class OnlinePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  address1: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  address2?: string;

  @ApiProperty()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty()
  @IsNotEmpty()
  cvv: string;
}

export enum PaymentSelection {
  Online = 1,
  Transfer = 2,
}

export default class OrderInDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  contactInfoId: number;

  @ApiProperty({ enum: PaymentSelection })
  @IsEnum(PaymentSelection)
  @IsNotEmpty()
  paymentSelection: PaymentSelection;

  @ApiProperty({ type: OnlinePaymentDto })
  @IsOptional()
  onlinePaymentDto?: OnlinePaymentDto;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  deliveryMethodId: number;
}
