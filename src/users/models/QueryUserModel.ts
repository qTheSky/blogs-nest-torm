import { DefaultPagination } from '../../shared/dto/BasePagination';
import { ApiProperty } from '@nestjs/swagger';

export class UsersQuery extends DefaultPagination {
  @ApiProperty({
    description: 'Search term for user Login: Login should contains this term in any position',
    required: false,
    default: null,
    type: String,
  })
  searchLoginTerm = '';
  @ApiProperty({
    description: 'Search term for user Email: Email should contains this term in any position',
    required: false,
    default: null,
    type: String,
  })
  searchEmailTerm = '';
  @ApiProperty({
    required: false,
    enum: ['all', 'banned', 'notBanned'],
    default: 'all',
  })
  banStatus = 'all'; // all, banned, notBanned
}
