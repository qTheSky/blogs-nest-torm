import { DefaultPagination } from '../../shared/dto/BasePagination';

export class GamesQuery extends DefaultPagination {
  sortBy = 'pairCreatedDate';
}
