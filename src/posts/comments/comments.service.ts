import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsRepository } from './comments.repository';
import { CommentDocument } from './comment.schema';
import { LikesCommentsRepository } from './likes/likesComments.repository';
import { LikeComment } from './likes/likeComment.schema';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private likesCommentsRepository: LikesCommentsRepository,
  ) {}

  async findCommentById(id: Types.ObjectId): Promise<CommentDocument | null> {
    return await this.commentsRepository.findCommentById(id);
  }

  async findLikeOfSpecifiedUser(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<LikeComment | null> {
    return await this.likesCommentsRepository.findLikeByUserIdAndCommentId(userId, commentId);
  }

  async findLikesForComment(commentId: Types.ObjectId): Promise<LikeComment[]> {
    return await this.likesCommentsRepository.findLikesForComment(commentId);
  }
}
