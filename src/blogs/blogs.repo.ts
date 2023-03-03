import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CreateBlogModel } from './models/CreateBlogModel';

@Injectable()
export class BlogsRepo {
  constructor(@InjectRepository(BlogEntity) private readonly repo: Repository<BlogEntity>) {}

  async create(user: UserEntity, createBlogModel: CreateBlogModel): Promise<BlogEntity> {
    const newBlog = BlogEntity.create(user, createBlogModel);
    return await this.save(newBlog);
  }

  async deleteBlog(id: number) {
    await this.repo.delete(id);
  }

  async findById(id: number): Promise<BlogEntity | null> {
    return this.repo.findOneBy({ id, banInfo: { isBanned: false } });
  }

  async get(id: number): Promise<BlogEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async save(blog: BlogEntity): Promise<BlogEntity> {
    return await this.repo.save(blog);
  }
}
