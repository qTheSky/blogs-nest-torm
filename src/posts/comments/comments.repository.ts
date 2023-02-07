import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModel } from './comment.schema';
import { CreateCommentModel } from './models/CreateCommentModel';
import { Types } from 'mongoose';

export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModel) {}

  async create(dto: {
    createCommentModel: CreateCommentModel;
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    userLogin: string;
    blogOwnerId: Types.ObjectId;
  }): Promise<Comment> {
    const comment = this.CommentModel.createComment({
      CommentModel: this.CommentModel,
      content: dto.createCommentModel.content,
      postId: dto.postId,
      userId: dto.userId,
      userLogin: dto.userLogin,
      blogOwnerId: dto.blogOwnerId,
    });
    return await comment.save();
  }

  async findCommentById(_id: Types.ObjectId): Promise<CommentDocument | null> {
    const filter = { _id, isUserBanned: { $ne: true } };
    return this.CommentModel.findOne(filter);
  }

  async deleteComment(comment: CommentDocument) {
    await comment.delete();
  }

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }

  async findAllCommentsOfUser(userId: Types.ObjectId): Promise<CommentDocument[]> {
    debugger;
    return this.CommentModel.find({ userId });
  }
}
