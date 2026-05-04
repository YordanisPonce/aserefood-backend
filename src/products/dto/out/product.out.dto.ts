import { ApiProperty } from '@nestjs/swagger';

export class CategoryProductOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export default class ProductOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  image?: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [CategoryProductOutDto] })
  categories: CategoryProductOutDto[];

  @ApiProperty()
  isService: boolean;
}