import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepo } from '../../quiz.questions.repo';

export class DeleteQuestionCommand {
  constructor(public questionId: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  constructor(public quizRepo: QuizQuestionsRepo) {}

  async execute(command: DeleteQuestionCommand) {
    await this.quizRepo.delete(command.questionId);
  }
}
