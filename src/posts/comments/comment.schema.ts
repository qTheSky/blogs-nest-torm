import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  postId: Types.ObjectId;

  @Prop({ default: false })
  isUserBanned: boolean;

  @Prop({ required: true })
  blogOwnerId: Types.ObjectId;

  static createComment(dto: {
    CommentModel: CommentModel;
    content: string;
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    userLogin: string;
    blogOwnerId: Types.ObjectId;
  }) {
    const newComment = new dto.CommentModel();
    newComment.createdAt = new Date();
    newComment.content = dto.content;
    newComment.postId = dto.postId;
    newComment.userId = dto.userId;
    newComment.userLogin = dto.userLogin;
    newComment.blogOwnerId = dto.blogOwnerId;
    return newComment;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {};

const commentStaticMethods: CommentModelStatic = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;

type CommentModelStatic = {
  createComment: (dto: {
    CommentModel: CommentModel;
    content: string;
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    userLogin: string;
    blogOwnerId: Types.ObjectId;
  }) => CommentDocument;
};

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModel = Model<CommentDocument> & CommentModelStatic;
