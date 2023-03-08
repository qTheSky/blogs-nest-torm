import { BasePagination } from '../../../shared/dto/BasePagination';

export class QuizQuestionsQuery extends BasePagination {
  bodySearchTerm = '';
  publishedStatus = 'all';
}
