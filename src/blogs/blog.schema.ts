import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { BannedUserInBlogDocument, BannedUserInBlogModel } from './banned-user-in-blog.schema';

@Schema({ _id: false })
class BlogBanInfo {
  @Prop({ default: false })
  isBanned: boolean;
  @Prop({ default: null })
  banDate: Date | null;
}

@Schema()
export class _Blog {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ default: { isBanned: false, banDate: null }, required: true })
  banInfo: BlogBanInfo;

  ban() {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
  }

  unBan() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
  }

  createBannedUser(
    BannedUserInBlogModel: BannedUserInBlogModel,
    dto: {
      userId: Types.ObjectId;
      userLogin: string;
      banReason: string;
    },
  ): BannedUserInBlogDocument {
    const newBannedUser = new BannedUserInBlogModel();
    newBannedUser.userId = dto.userId;
    newBannedUser.login = dto.userLogin;
    newBannedUser.banDate = new Date();
    newBannedUser.banReason = dto.banReason;
    newBannedUser.blogId = this._id;
    return newBannedUser;
  }

  static createBlog(
    BlogModel: BlogModel,
    userId: Types.ObjectId,
    userLogin: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): BlogDocument {
    const createdBlog = new BlogModel();
    createdBlog.userId = userId;
    createdBlog.userLogin = userLogin;
    createdBlog.name = name;
    createdBlog.description = description;
    createdBlog.websiteUrl = websiteUrl;
    createdBlog.createdAt = new Date();
    return createdBlog;
  }
}

export const BlogSchema = SchemaFactory.createForClass(_Blog);

BlogSchema.methods = {
  ban: _Blog.prototype.ban,
  unBan: _Blog.prototype.unBan,
  createBannedUser: _Blog.prototype.createBannedUser,
};

const blogStaticMethods: BlogStatics = {
  createBlog: _Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;

type BlogStatics = {
  createBlog: (
    BlogModel: BlogModel,
    userId: Types.ObjectId,
    userLogin: string,
    name: string,
    description: string,
    websiteUrl: string,
  ) => BlogDocument;
};

export type BlogDocument = HydratedDocument<_Blog>;

export type BlogModel = Model<BlogDocument> & BlogStatics;
