import { BasicPagination } from '../../shared/dto/BasePagination';

export class TopPlayersQuery extends BasicPagination {
  sort = ['avgScores desc', 'sumScore desc'];
}
