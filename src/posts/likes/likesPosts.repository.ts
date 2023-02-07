import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikePost, LikePostDocument, LikePostModel } from './likePost.schema';
import { LikeStatuses } from '../../common/like.types';
import { Types } from 'mongoose';

@Injectable()
export class LikesPostsRepository {
  constructor(@InjectModel(LikePost.name) private LikePostModel: LikePostModel) {}

  async create(
    userId: Types.ObjectId,
    userLogin: string,
    status: LikeStatuses,
    postId: Types.ObjectId,
  ): Promise<boolean> {
    // const like = this.LikePostModel.createLikePost(this.LikePostModel, userId, userLogin, status, postId);
    const like = new this.LikePostModel();
    like.userId = userId;
    like.userLogin = userLogin;
    like.status = status;
    like.postId = postId;
    like.addedAt = new Date();
    await like.save();
    return true;
  }

  async save(like: LikePostDocument) {
    return await like.save();
  }

  async findLikeByUserIdAndPostId(userId: Types.ObjectId, postId: Types.ObjectId): Promise<LikePostDocument | null> {
    return this.LikePostModel.findOne({ userId, postId });
  }

  async findLikesForPost(postId: Types.ObjectId): Promise<LikePostDocument[]> {
    const filter = { postId, isUserBanned: { $ne: true } };
    const sort: any = {
      ['addedAt']: -1,
    };
    return this.LikePostModel.find(filter).sort(sort).lean();
  }

  async findAllLikesOfUser(userId: Types.ObjectId): Promise<LikePostDocument[]> {
    return this.LikePostModel.find({ userId });
  }
}
