import { Injectable } from '@nestjs/common';
import { Blog } from '../entities/blog.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostModel } from './models/CreatePostModel';
import { cutLikesByBannedUsers } from './utils/cut-likes-by-banned-users';

@Injectable()
export class PostsRepo {
  constructor(@InjectRepository(Post) private readonly repo: Repository<Post>) {}

  async create(blog: Blog, user: User, createPostModel: CreatePostModel): Promise<Post> {
    const newPost = blog.createPost(user, blog, createPostModel);
    return await this.save(newPost);
  }

  async deletePost(id) {
    return this.repo.delete({ id });
  }

  async findPostById(id: number): Promise<Post | null> {
    const post = await this.repo.findOneBy({
      id,
      blog: { banInfo: { isBanned: false } },
    });
    if (post) {
      post.likes = cutLikesByBannedUsers(post.likes);
    }
    return post;
  }

  async get(id: number): Promise<Post | null> {
    return this.repo.findOneBy({ id });
  }

  async save(post: Post): Promise<Post> {
    return await this.repo.save(post);
  }
}
