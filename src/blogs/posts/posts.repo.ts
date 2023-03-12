import { Injectable } from '@nestjs/common';
import { BlogEntity } from '../entities/blog.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostModel } from './models/CreatePostModel';
import { cutLikesByBannedUsers } from './utils/cut-likes-by-banned-users';

@Injectable()
export class PostsRepo {
  constructor(@InjectRepository(PostEntity) private readonly repo: Repository<PostEntity>) {}

  async create(blog: BlogEntity, user: UserEntity, createPostModel: CreatePostModel): Promise<PostEntity> {
    const newPost = blog.createPost(user, blog, createPostModel);
    return await this.save(newPost);
  }

  async deletePost(id) {
    return this.repo.delete({ id });
  }

  async findPostById(id: number): Promise<PostEntity | null> {
    const post = await this.repo.findOneBy({
      id,
      blog: { banInfo: { isBanned: false } },
    });
    if (post) {
      post.likes = cutLikesByBannedUsers(post.likes);
    }
    return post;
  }

  async get(id: number): Promise<PostEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async save(post: PostEntity): Promise<PostEntity> {
    return await this.repo.save(post);
  }
}
