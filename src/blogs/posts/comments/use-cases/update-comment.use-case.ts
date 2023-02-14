import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentModel } from '../models/UpdateCommentModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepo } from '../comments,repo';

export class UpdateCommentCommand {
  constructor(public commentId: number, public currentUserId: number, public updateCommentModel: UpdateCommentModel) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private commentsRepo: CommentsRepo) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepo.findCommentById(command.commentId);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    if (comment.userId !== command.commentId) {
      throw new ForbiddenException("You can't update a comment that isn't yours");
    }
    comment.content = command.updateCommentModel.content;
    await this.commentsRepo.save(comment);
  }
}
