import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { User } from '../../../../users/entities/user.entity';
import { LikeComment } from '../likes/likeComment.entity';
import { LikeStatuses } from '../../../../common/like.types';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Post, (p) => p.comments, { eager: true })
  post: Post;
  @Column()
  postId: number;
  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  user: User;
  @Column({ nullable: true })
  userId: number;
  @OneToMany(() => LikeComment, (l) => l.comment)
  likes: LikeComment[];

  @Column()
  content: string;
  @Column()
  createdAt: Date;

  createLike(user: User, comment: Comment, likeStatus: LikeStatuses): LikeComment {
    const like = new LikeComment();

    like.user = user;
    like.comment = this;
    like.comment = comment;
    like.addedAt = new Date();
    like.status = likeStatus;

    return like;
  }
}
