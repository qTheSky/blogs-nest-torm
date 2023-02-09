export type PaginatorResponseType<I> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: I;
};

export const PaginatorWithItems: PaginatorResponseType<any[]> = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: [],
};
