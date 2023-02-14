import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeComment } from './likeComment.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { LikeStatuses } from '../../../../common/like.types';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class LikesCommentsRepo {
  constructor(@InjectRepository(LikeComment) private readonly repo: Repository<LikeComment>) {}

  async create(user: User, comment: Comment, status: LikeStatuses): Promise<LikeComment> {
    const newLike = comment.createLike(user, comment, status);
    return await this.save(newLike);
  }

  async findLikeOfSpecifiedUser(userId: number, commentId: number): Promise<LikeComment | null> {
    return this.repo.findOneBy({ userId, commentId });
  }

  async save(like: LikeComment): Promise<LikeComment> {
    return await this.repo.save(like);
  }
}
