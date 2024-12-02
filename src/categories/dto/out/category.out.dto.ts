import { ApiProperty } from '@nestjs/swagger';

export default class CategoryOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ nullable: true })
  parentId?: number;

  @ApiProperty({ nullable: true })
  parentName?: string;

  @ApiProperty({ type: [CategoryOutDto], nullable: true })
  children?: CategoryOutDto[];
}
