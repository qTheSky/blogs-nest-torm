import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentModel } from './models/CreateCommentModel';
import { Post } from '../entities/post.entity';
import { UserEntity } from '../../../users/entities/user.entity';
import { cutLikesByBannedUsers } from '../utils/cut-likes-by-banned-users';

@Injectable()
export class CommentsRepo {
  constructor(@InjectRepository(Comment) private readonly repo: Repository<Comment>) {}

  async create(user: UserEntity, post: Post, createCommentModel: CreateCommentModel): Promise<Comment> {
    const newComment = post.createComment(user, post, createCommentModel);
    return this.save(newComment);
  }

  async deleteComment(id: number) {
    return this.repo.delete({ id });
  }

  async findCommentById(id: number): Promise<Comment | null> {
    const comment = await this.repo.findOneBy({ id, user: { banInfo: { isBanned: false } } });
    if (comment) {
      comment.likes = cutLikesByBannedUsers(comment.likes);
    }
    return comment;
  }

  async save(comment: Comment): Promise<Comment> {
    return await this.repo.save(comment);
  }
}
