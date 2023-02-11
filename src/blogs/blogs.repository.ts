import { InjectModel } from '@nestjs/mongoose';
import { _Blog, BlogDocument, BlogModel } from './blog.schema';
import { CreateBlogModel } from './models/CreateBlogModel';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(_Blog.name) private BlogModel: BlogModel) {}

  async create(userId: Types.ObjectId, userLogin: string, createBlogModel: CreateBlogModel): Promise<_Blog> {
    const blog = this.BlogModel.createBlog(
      this.BlogModel,
      userId,
      userLogin,
      createBlogModel.name,
      createBlogModel.description,
      createBlogModel.websiteUrl,
    );
    return await blog.save();
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }

  async get(id): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id);
  }

  async findById(_id: Types.ObjectId): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({ _id, 'banInfo.isBanned': { $ne: true } });
  }

  async deleteBlog(_id): Promise<boolean> {
    const blog = await this.get(_id);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    await blog.delete();
    return true;
  }
}
