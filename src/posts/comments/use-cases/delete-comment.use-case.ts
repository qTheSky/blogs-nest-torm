import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsRepository } from '../comments.repository';

export class DeleteCommentCommand {
  constructor(public commentId: Types.ObjectId, public userId: Types.ObjectId) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private commentsRepository: CommentsRepository) {}
  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findCommentById(command.commentId);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    if (!comment.userId.equals(command.userId)) {
      throw new ForbiddenException("You can't delete a comment that isn't yours");
    }
    await this.commentsRepository.deleteComment(comment);
  }
}
