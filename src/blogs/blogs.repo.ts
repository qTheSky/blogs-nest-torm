import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateBlogModel } from './models/CreateBlogModel';

@Injectable()
export class BlogsRepo {
  constructor(@InjectRepository(Blog) private readonly repo: Repository<Blog>) {}

  async create(user: User, createBlogModel: CreateBlogModel): Promise<Blog> {
    const newBlog = Blog.create(user, createBlogModel);
    return await this.save(newBlog);
  }

  async deleteBlog(id: number) {
    await this.repo.delete(id);
  }

  async findById(id: number): Promise<Blog | null> {
    return this.repo.findOneBy({ id });
  }

  async get(id: number): Promise<Blog | null> {
    return this.repo.findOneBy({ id });
  }

  async save(blog: Blog): Promise<Blog> {
    return await this.repo.save(blog);
  }
}
