import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UpdateCommentModel } from '../models/UpdateCommentModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: Types.ObjectId,
    public currentUserId: Types.ObjectId,
    public updateCommentModel: UpdateCommentModel,
  ) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private commentsRepository: CommentsRepository) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findCommentById(command.commentId);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    if (!comment.userId.equals(command.currentUserId))
      throw new ForbiddenException("You can't update a comment that isn't yours");
    comment.content = command.updateCommentModel.content;
    await this.commentsRepository.save(comment);
  }
}
