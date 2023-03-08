import { BasePagination } from '../../shared/dto/BasePagination';

export class UsersQuery extends BasePagination {
  searchLoginTerm = '';
  searchEmailTerm = '';
  banStatus = 'all'; // all, banned, notBanned
}
