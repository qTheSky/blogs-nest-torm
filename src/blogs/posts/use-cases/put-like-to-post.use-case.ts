import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { LikeStatuses } from '../../../common/like.types';
import { PostsRepo } from '../posts.repo';
import { UsersRepo } from '../../../users/users.repo';
import { LikesPostsRepo } from '../likes/likesPosts.repo';

export class PutLikeToPostCommand {
  constructor(public postId: number, public currentUserId: number, public likeStatus: LikeStatuses) {}
}

@CommandHandler(PutLikeToPostCommand)
export class PutLikeToPostUseCase implements ICommandHandler<PutLikeToPostCommand, void> {
  constructor(private postsRepo: PostsRepo, private usersRepo: UsersRepo, private likesPostsRepo: LikesPostsRepo) {}
  async execute(command: PutLikeToPostCommand): Promise<void> {
    const post = await this.postsRepo.get(command.postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const user = await this.usersRepo.findUserById(command.currentUserId);
    const like = await this.likesPostsRepo.findLikeOfSpecifiedUser(user.id, post.id);
    if (!like) {
      await this.likesPostsRepo.create(user, post, command.likeStatus);
      return;
    }
    if (like && like.status !== command.likeStatus) {
      like.status = command.likeStatus;
      await this.likesPostsRepo.save(like);
    }
  }
}
