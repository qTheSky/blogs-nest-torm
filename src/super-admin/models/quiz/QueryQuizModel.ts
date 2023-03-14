import { DefaultPagination } from '../../../shared/dto/BasePagination';
import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionsQuery extends DefaultPagination {
  @ApiProperty({ required: false, default: null, type: String })
  bodySearchTerm = '';
  @ApiProperty({ required: false, default: 'all', enum: ['all', 'published', 'notPublished'] })
  publishedStatus = 'all';
}
