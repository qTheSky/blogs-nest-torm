import { Column, Entity, ManyToOne } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Like } from '../../common/like.entity';

@Entity('LikesComment')
export class LikeComment extends Like {
  @Column()
  commentId: number;
  @ManyToOne(() => Comment, (c) => c.likes)
  comment: Comment;
}
