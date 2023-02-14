import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedUserInBlog } from './entities/banned-user-in-blog.entity';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BannedUsersInBlogRepo {
  constructor(@InjectRepository(BannedUserInBlog) private readonly repo: Repository<BannedUserInBlog>) {}

  async create(blog: Blog, user: User, banReason: string): Promise<BannedUserInBlog> {
    const bannedUser = blog.createBannedUser(blog, { user, banReason });
    return this.save(bannedUser);
  }

  async deleteBannedUser(blogId: number, userId: number) {
    await this.repo.delete({ blogId, userId });
  }

  async findBannedUser(blogId: number, userId: number): Promise<BannedUserInBlog | null> {
    return this.repo.findOneBy({ blogId, userId });
  }

  async save(bannedUser: BannedUserInBlog): Promise<BannedUserInBlog> {
    return await this.repo.save(bannedUser);
  }
}
