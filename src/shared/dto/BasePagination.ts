import { Transform } from 'class-transformer';

export class BasePagination {
  @Transform((v) => toNumber(v.value, 1))
  pageNumber = 1;
  @Transform((v) => toNumber(v.value, 10))
  pageSize = 10;
  sortBy = 'createdAt';
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
