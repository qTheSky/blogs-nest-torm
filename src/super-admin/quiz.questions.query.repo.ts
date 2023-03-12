import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestion } from './quiz/QuizQuestion.entity';
import { FindOptionsOrder, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { QuizQuestionViewModel } from './models/quiz/QuizQuestionViewModel';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { QuizQuestionsQuery } from './models/quiz/QueryQuizModel';

@Injectable()
export class QuizQuestionsQueryRepo {
  constructor(
    @InjectRepository(QuizQuestion) private readonly repo: Repository<QuizQuestion>,
    private viewModelMapper: ViewModelMapper,
  ) {}

  async findQuestions(query: QuizQuestionsQuery): Promise<PaginatorResponseType<QuizQuestionViewModel[]>> {
    const where: FindOptionsWhere<QuizQuestion> = {};
    const order: FindOptionsOrder<QuizQuestion> = { [query.sortBy]: query.sortDirection };

    if (query.bodySearchTerm) {
      where.body = ILike(`%${query.bodySearchTerm}%`);
    }

    if (query.publishedStatus !== 'all') {
      where.published = getTrueOrFalse(query.publishedStatus);

      function getTrueOrFalse(publishedStatus: string): boolean {
        switch (publishedStatus) {
          case 'published':
            return true;
          case 'notPublished':
            return false;
          default:
            return;
        }
      }
    }

    const [questions, totalCount] = await this.repo.findAndCount({
      where,
      order,
      skip: (query.pageNumber - 1) * query.pageSize,
      take: query.pageSize,
    });

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: questions.map(this.viewModelMapper.getQuizQuestionViewModel),
    };
  }
}
