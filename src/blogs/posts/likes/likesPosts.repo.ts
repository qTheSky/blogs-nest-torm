import { UserEntity } from '../../../users/entities/user.entity';
import { LikeStatuses } from '../../../common/like.types';
import { Post } from '../entities/post.entity';
import { LikePost } from './LikePost.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LikesPostsRepo {
  constructor(@InjectRepository(LikePost) private readonly repo: Repository<LikePost>) {}
  async create(user: UserEntity, post: Post, status: LikeStatuses) {
    const newLike = post.createLike(post, user, status);
    return this.save(newLike);
  }

  async findLikeOfSpecifiedUser(userId: number, postId: number): Promise<LikePost | null> {
    return this.repo.findOneBy({ userId, postId });
  }

  async save(like: LikePost): Promise<LikePost> {
    return await this.repo.save(like);
  }
}
