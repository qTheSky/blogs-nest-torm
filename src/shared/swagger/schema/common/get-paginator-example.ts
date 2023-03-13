import { PaginatorResponseType } from '../../../types/paginator-response-type';

export const getPaginatorExample = <VM>(subject: VM): PaginatorResponseType<VM[]> => ({
  pagesCount: 0,
  page: 0,
  pageSize: 0,
  totalCount: 0,
  items: [subject],
});
