import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepo } from '../../quiz.questions.repo';
import { PublishQuestionModel } from '../../models/quiz/PublishQuestionModel';

export class PublishQuestionCommand {
  constructor(public questionId: number, public dto: PublishQuestionModel) {}
}
@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(public quizRepo: QuizQuestionsRepo) {}

  async execute(command: PublishQuestionCommand) {
    const question = await this.quizRepo.findById(command.questionId);
    question.published = command.dto.published;
    await this.quizRepo.save(question);
  }
}
