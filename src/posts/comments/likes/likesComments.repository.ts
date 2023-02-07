import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeComment, LikeCommentDocument, LikeCommentModel } from './likeComment.schema';
import { Types } from 'mongoose';
import { LikeStatuses } from '../../../common/like.types';

@Injectable()
export class LikesCommentsRepository {
  constructor(@InjectModel(LikeComment.name) private LikeCommentModel: LikeCommentModel) {}

  async create(
    userId: Types.ObjectId,
    userLogin: string,
    status: LikeStatuses,
    commentId: Types.ObjectId,
  ): Promise<LikeCommentDocument> {
    // const like = this.LikeCommentModel.createLikeComment(this.LikeCommentModel, userId, status, commentId);
    const like = new this.LikeCommentModel();
    like.userId = userId;
    like.userLogin = userLogin;
    like.status = status;
    like.commentId = commentId;
    like.addedAt = new Date();
    return await like.save();
  }

  async findLikeByUserIdAndCommentId(userId: Types.ObjectId, commentId: Types.ObjectId): Promise<LikeComment | null> {
    return this.LikeCommentModel.findOne({ userId, commentId }).lean();
  }

  async deleteLike(userId: Types.ObjectId, commentId: Types.ObjectId): Promise<boolean> {
    const like = await this.LikeCommentModel.findOne({ userId, commentId });
    if (!like) return false;
    await like.delete();
    return true;
  }

  async findLikesForComment(commentId: Types.ObjectId): Promise<LikeComment[]> {
    const filter = { commentId, isUserBanned: { $ne: true } };
    return this.LikeCommentModel.find(filter).lean();
  }

  async findAllLikesOfUser(userId: Types.ObjectId): Promise<LikeCommentDocument[]> {
    return this.LikeCommentModel.find({ userId });
  }

  async save(likeComment: LikeCommentDocument): Promise<LikeCommentDocument> {
    return await likeComment.save();
  }
}
