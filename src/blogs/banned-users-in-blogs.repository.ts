import { InjectModel } from '@nestjs/mongoose';
import { BannedUserInBlog, BannedUserInBlogDocument, BannedUserInBlogModel } from './banned-user-in-blog.schema';
import { Types } from 'mongoose';
import { BlogDocument } from './blog.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BannedUsersInBlogsRepository {
  constructor(@InjectModel(BannedUserInBlog.name) private BannedUserInBlogModel: BannedUserInBlogModel) {}

  async create(
    blog: BlogDocument,
    userId: Types.ObjectId,
    userLogin: string,
    banReason: string,
  ): Promise<BannedUserInBlog> {
    const bannedUser = blog.createBannedUser(this.BannedUserInBlogModel, { userId, banReason, userLogin });
    return await bannedUser.save();
  }

  async save(bannedUser: BannedUserInBlogDocument): Promise<BannedUserInBlogDocument> {
    return await bannedUser.save();
  }

  async findBannedUser(blogId: Types.ObjectId, userId: Types.ObjectId): Promise<BannedUserInBlogDocument | null> {
    return this.BannedUserInBlogModel.findOne({ blogId, userId });
  }

  async deleteBannedUser(blogId: Types.ObjectId, userId: Types.ObjectId) {
    await this.BannedUserInBlogModel.findOneAndDelete({ blogId, userId });
  }
}
