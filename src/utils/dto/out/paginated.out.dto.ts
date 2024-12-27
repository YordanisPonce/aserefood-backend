import { ApiProperty } from '@nestjs/swagger';

export default class PaginatedOutDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  data: T[] = [];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  get hasNextPage(): boolean {
    return this.page * this.pageSize < this.total;
  }

  @ApiProperty()
  get hasPreviousPage(): boolean {
    return this.page > 1;
  }
}