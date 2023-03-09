import { Transform } from 'class-transformer';

export class BasicPagination {
  @Transform((v) => toNumber(v.value, 1))
  pageNumber = 1;
  @Transform((v) => toNumber(v.value, 10))
  pageSize = 10;
}

export class DefaultPagination extends BasicPagination {
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
