import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepo } from '../comments,repo';

export class DeleteCommentCommand {
  constructor(public commentId: number, public currentUserId: number) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private commentsRepo: CommentsRepo) {}
  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepo.findCommentById(command.commentId);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    if (comment.userId !== command.currentUserId) {
      throw new ForbiddenException("You can't delete a comment that isn't yours");
    }
    await this.commentsRepo.deleteComment(comment.id);
  }
}
