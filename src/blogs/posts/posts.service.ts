import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostEntity } from './entities/post.entity';
import { BlogsRepo } from '../blogs.repo';
import { PostsRepo } from './posts.repo';

@Injectable()
export class PostsService {
  constructor(private blogsRepo: BlogsRepo, private postsRepo: PostsRepo) {}
  async validateExistPostAndOwnByUser(blogId: number, postId: number, userId: number): Promise<PostEntity> {
    const blog = await this.blogsRepo.findById(blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    const post = await this.postsRepo.findPostById(postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    if (post.userId !== userId) throw new ForbiddenException('This post doesnt belong to you');
    return post;
  }
}
