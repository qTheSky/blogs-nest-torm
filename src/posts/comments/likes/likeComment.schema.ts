import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Like } from '../../../common/like';

@Schema()
export class LikeComment extends Like {
  @Prop({ required: true })
  commentId: Types.ObjectId;

  // static createLikeComment(
  //   LikeCommentModel: LikeCommentModel,
  //   userId: Types.ObjectId,
  //   status: LikeStatuses,
  //   commentId: Types.ObjectId,
  // ): LikeCommentDocument {
  //   console.log('LIKE-COMMENT method');
  //   const createdLike = new LikeCommentModel();
  //   createdLike.userId = userId;
  //   createdLike.addedAt = new Date();
  //   createdLike.status = status;
  //   createdLike.commentId = commentId;
  //   return createdLike;
  // }
}

export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);

LikeCommentSchema.methods = {};

const likeCommentStaticMethods: LikeCommentModelStatic = {
  // createLikeComment: LikeComment.createLikeComment,
};

LikeCommentSchema.statics = likeCommentStaticMethods;

type LikeCommentModelStatic = {
  // createLikeComment: (
  //   LikeCommentModel: LikeCommentModel,
  //   userId: Types.ObjectId,
  //   status: LikeStatuses,
  //   commentId: Types.ObjectId,
  // ) => LikeCommentDocument;
};

export type LikeCommentDocument = HydratedDocument<LikeComment>;

export type LikeCommentModel = Model<LikeComment> & LikeCommentModelStatic;
