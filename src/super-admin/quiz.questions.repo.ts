import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestion } from './quiz/QuizQuestion.entity';
import { Repository } from 'typeorm';
import { CreateQuizQuestionModel } from './models/quiz/CreateQuizQuestionModel';

@Injectable()
export class QuizQuestionsRepo {
  constructor(@InjectRepository(QuizQuestion) private readonly repo: Repository<QuizQuestion>) {}
  async create(dto: CreateQuizQuestionModel) {
    const newQuestion = QuizQuestion.create(dto.body, dto.correctAnswers);
    return await this.save(newQuestion);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findById(id: number): Promise<QuizQuestion> {
    return this.repo.findOneBy({ id });
  }

  async save(question: QuizQuestion): Promise<QuizQuestion> {
    return await this.repo.save(question);
  }

  async getFiveRandomQuestions(): Promise<QuizQuestion[]> {
    return this.repo.createQueryBuilder('q').select().where('q.published = true').orderBy('RANDOM()').take(5).getMany();
  }
}
