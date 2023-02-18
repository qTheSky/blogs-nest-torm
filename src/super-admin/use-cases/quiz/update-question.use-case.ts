import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepo } from '../../quiz.questions.repo';
import { UpdateQuizQuestionModel } from '../../models/quiz/UpdateQuizQuestionModel';

export class UpdateQuestionCommand {
  constructor(public questionId: number, public dto: UpdateQuizQuestionModel) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private quizRepo: QuizQuestionsRepo) {}

  async execute(command: UpdateQuestionCommand) {
    const question = await this.quizRepo.findById(command.questionId);
    question.body = command.dto.body;
    question.correctAnswers = command.dto.correctAnswers;
    await this.quizRepo.save(question);
  }
}
