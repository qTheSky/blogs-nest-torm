import { BasePagination } from '../../shared/dto/BasePagination';

export class BlogsQuery extends BasePagination {
  searchNameTerm = '';
}

export interface QueryBlogModel {
  searchNameTerm?: string;
  pageNumber?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
}
