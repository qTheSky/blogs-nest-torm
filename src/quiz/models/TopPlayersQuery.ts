import { BasicPagination } from '../../shared/dto/BasePagination';
import { ApiProperty } from '@nestjs/swagger';

export class TopPlayersQuery extends BasicPagination {
  @ApiProperty({ required: false, default: '?sort=avgScores desc&sort=sumScore desc', type: [String] })
  sort = ['avgScores desc', 'sumScore desc'];
}
