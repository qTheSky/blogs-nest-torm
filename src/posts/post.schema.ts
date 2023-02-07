import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema()
export class Post {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: Types.ObjectId;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: false })
  isBlogBanned: boolean;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  userId: Types.ObjectId;

  static createPost(
    PostModel: PostModel,
    userId: Types.ObjectId,
    blogId: Types.ObjectId,
    blogName: string,
    title: string,
    shortDescription: string,
    content: string,
  ) {
    const createdPost = new PostModel();
    createdPost.blogId = blogId;
    createdPost.blogName = blogName;
    createdPost.title = title;
    createdPost.userId = userId;
    createdPost.shortDescription = shortDescription;
    createdPost.content = content;
    createdPost.createdAt = new Date();
    return createdPost;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {};

const postStaticMethods: PostModelStatic = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;

type PostModelStatic = {
  createPost: (
    PostModel: PostModel,
    userId: Types.ObjectId,
    blogId: Types.ObjectId,
    blogName: string,
    title: string,
    shortDescription: string,
    content: string,
  ) => PostDocument;
};

export type PostDocument = HydratedDocument<Post>;

export type PostModel = Model<PostDocument> & PostModelStatic;
