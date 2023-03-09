import { DefaultPagination } from '../../shared/dto/BasePagination';

export class UsersQuery extends DefaultPagination {
  searchLoginTerm = '';
  searchEmailTerm = '';
  banStatus = 'all'; // all, banned, notBanned
}
