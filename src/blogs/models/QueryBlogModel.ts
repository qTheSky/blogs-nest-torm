import { DefaultPagination } from '../../shared/dto/BasePagination';

export class BlogsQuery extends DefaultPagination {
  searchNameTerm = '';
}

export interface QueryBlogModel {
  searchNameTerm?: string;
  pageNumber?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
}
