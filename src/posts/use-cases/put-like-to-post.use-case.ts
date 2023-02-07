import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts.repository';
import { UsersRepository } from '../../users/users.repository';
import { LikeStatuses } from '../../common/like.types';
import { LikesPostsRepository } from '../likes/likesPosts.repository';

export class PutLikeToPostCommand {
  constructor(public postId: Types.ObjectId, public currentUserId: Types.ObjectId, public likeStatus: LikeStatuses) {}
}

@CommandHandler(PutLikeToPostCommand)
export class PutLikeToPostUseCase implements ICommandHandler<PutLikeToPostCommand, void> {
  constructor(
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private likesPostsRepository: LikesPostsRepository,
  ) {}
  async execute(command: PutLikeToPostCommand): Promise<void> {
    const post = await this.postsRepository.findById(command.postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const user = await this.usersRepository.findUserById(command.currentUserId);
    const like = await this.likesPostsRepository.findLikeByUserIdAndPostId(user._id, post._id);
    if (!like) {
      await this.likesPostsRepository.create(user._id, user.accountData.login, command.likeStatus, post._id);
      return;
    }
    if (like && like.status !== command.likeStatus) {
      like.status = command.likeStatus;
      await this.likesPostsRepository.save(like);
    }
  }
}
