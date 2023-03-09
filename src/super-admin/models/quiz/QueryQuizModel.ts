import { DefaultPagination } from '../../../shared/dto/BasePagination';

export class QuizQuestionsQuery extends DefaultPagination {
  bodySearchTerm = '';
  publishedStatus = 'all';
}
