import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsRepository } from '../comments.repository';
import { UsersRepository } from '../../../users/users.repository';
import { LikesCommentsRepository } from '../likes/likesComments.repository';
import { LikeStatuses } from '../../../common/like.types';

export class PutLikeToCommentCommand {
  constructor(public commentId: Types.ObjectId, public userId: Types.ObjectId, public likeStatus: LikeStatuses) {}
}

@CommandHandler(PutLikeToCommentCommand)
export class PutLikeToCommentUseCase implements ICommandHandler<PutLikeToCommentCommand> {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
    private likesCommentsRepository: LikesCommentsRepository,
  ) {}
  async execute(command: PutLikeToCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findCommentById(command.commentId);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    const user = await this.usersRepository.findUserById(command.userId);
    const like = await this.likesCommentsRepository.findLikeByUserIdAndCommentId(user._id, comment._id);
    if (!like) {
      await this.likesCommentsRepository.create(user._id, user.accountData.login, command.likeStatus, comment._id);
      return;
    }
    if (like.status === command.likeStatus) return;
    await this.likesCommentsRepository.deleteLike(user._id, comment._id);
    await this.likesCommentsRepository.create(user._id, user.accountData.login, command.likeStatus, comment._id);
  }
}
