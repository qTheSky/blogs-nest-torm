import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BasicPagination {
  @Transform((v) => toNumber(v.value, 1))
  @ApiProperty({ required: false, default: 1, type: Number })
  pageNumber = 1;
  @Transform((v) => toNumber(v.value, 10))
  @ApiProperty({ required: false, default: 10, type: Number })
  pageSize = 10;
}

export class DefaultPagination extends BasicPagination {
  @ApiProperty({ required: false, default: 'createdAt', type: String })
  sortBy = 'createdAt';
  @ApiProperty({ required: false, default: 'desc', enum: ['asc', 'desc'] })
  sortDirection = 'desc';
}

const toNumber = (value: string, defaultValue: number): number => {
  try {
    const parsedInt = parseInt(value, 10);
    if (isNaN(parsedInt)) return defaultValue;
    return parsedInt;
  } catch {
    return defaultValue;
  }
};
