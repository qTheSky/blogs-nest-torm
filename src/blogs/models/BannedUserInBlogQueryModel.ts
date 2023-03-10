import { DefaultPagination } from '../../shared/dto/BasePagination';
import { ApiProperty } from '@nestjs/swagger';

export class BannedUsersInBlogsQuery extends DefaultPagination {
  @ApiProperty({
    required: false,
    default: null,
    type: String,
    description: 'Search term for user Login: Login should contains this term in any position',
  })
  searchLoginTerm = '';
}
