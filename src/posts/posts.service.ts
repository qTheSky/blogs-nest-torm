import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Types } from 'mongoose';
import { LikePostDocument } from './likes/likePost.schema';
import { LikesPostsRepository } from './likes/likesPosts.repository';
import { BlogsService } from '../blogs/application/blogs.service';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsService: BlogsService,
    private likesPostsRepository: LikesPostsRepository,
  ) {}

  async findLikeOfSpecifiedUser(userId: Types.ObjectId, postId: Types.ObjectId): Promise<LikePostDocument | null> {
    return await this.likesPostsRepository.findLikeByUserIdAndPostId(userId, postId);
  }

  async findLikesForPost(postId: Types.ObjectId): Promise<LikePostDocument[]> {
    return await this.likesPostsRepository.findLikesForPost(postId);
  }
}
