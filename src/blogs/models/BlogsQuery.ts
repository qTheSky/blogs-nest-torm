import { DefaultPagination } from '../../shared/dto/BasePagination';
import { ApiProperty } from '@nestjs/swagger';

export class BlogsQuery extends DefaultPagination {
  @ApiProperty({
    description: 'Search term for blog Name: Name should contains this term in any position',
    required: false,
    default: null,
    type: String,
  })
  searchNameTerm = '';
}
