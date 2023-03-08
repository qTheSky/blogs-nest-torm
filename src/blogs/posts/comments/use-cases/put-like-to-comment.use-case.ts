import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { LikeStatuses } from '../../../../shared/like.types';
import { CommentsRepo } from '../comments,repo';
import { UsersRepo } from '../../../../users/users.repo';
import { LikesCommentsRepo } from '../likes/likes-comments-repo';

export class PutLikeToCommentCommand {
  constructor(public commentId: number, public userId: number, public likeStatus: LikeStatuses) {}
}

@CommandHandler(PutLikeToCommentCommand)
export class PutLikeToCommentUseCase implements ICommandHandler<PutLikeToCommentCommand> {
  constructor(
    private commentsRepo: CommentsRepo,
    private usersRepo: UsersRepo,
    private likeCommentsRepo: LikesCommentsRepo,
  ) {}
  async execute(command: PutLikeToCommentCommand): Promise<void> {
    const comment = await this.commentsRepo.findCommentById(command.commentId);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    const user = await this.usersRepo.findUserById(command.userId);
    const like = await this.likeCommentsRepo.findLikeOfSpecifiedUser(user.id, comment.id);
    if (!like) {
      await this.likeCommentsRepo.create(user, comment, command.likeStatus);
      return;
    }
    if (like && like.status !== command.likeStatus) {
      like.status = command.likeStatus;
      await this.likeCommentsRepo.save(like);
    }
  }
}
