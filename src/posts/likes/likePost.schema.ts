import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeCommentSchema } from '../comments/likes/likeComment.schema';
import { Like } from '../../common/like';

@Schema()
export class LikePost extends Like {
  @Prop({ required: true })
  postId: Types.ObjectId;

  // static createLikePost(
  //   LikePostModel: LikePostModel,
  //   userId: Types.ObjectId,
  //   userLogin: string,
  //   status: LikeStatuses,
  //   postId: Types.ObjectId,
  // ) {
  //   console.log('LIKE-POST method');
  //   const createdLike = new LikePostModel();
  //   createdLike.userId = userId;
  //   createdLike.addedAt = new Date();
  //   createdLike.status = status;
  //   createdLike.postId = postId;
  //   createdLike.userLogin = userLogin;
  //   return createdLike;
  // }
}

export const LikePostSchema = SchemaFactory.createForClass(LikePost);

LikePostSchema.methods = {};

const likePostStaticMethods: LikePostModelStatic = {
  // createLikePost: LikePost.createLikePost,
};

LikeCommentSchema.statics = likePostStaticMethods;

type LikePostModelStatic = {
  //   createLikePost: (
  //     LikePostModel: LikePostModel,
  //     userId: Types.ObjectId,
  //     userLogin: string,
  //     status: LikeStatuses,
  //     postId: Types.ObjectId,
  //   ) => LikePostDocument;
};

export type LikePostDocument = HydratedDocument<LikePost>;

export type LikePostModel = Model<LikePost> & LikePostModelStatic;
