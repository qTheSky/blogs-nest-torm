import { CreateQuizQuestionModel } from '../../models/quiz/CreateQuizQuestionModel';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestion } from '../../quiz/QuizQuestion.entity';
import { QuizQuestionsRepo } from '../../quiz.questions.repo';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuizQuestionModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(private quizRepo: QuizQuestionsRepo) {}
  async execute(command: CreateQuestionCommand): Promise<QuizQuestion> {
    return await this.quizRepo.create(command.dto);
  }
}
