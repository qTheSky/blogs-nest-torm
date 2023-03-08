import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { UserEntity } from '../../../../users/entities/user.entity';
import { LikeComment } from '../likes/likeComment.entity';
import { LikeStatuses } from '../../../../shared/like.types';

@Entity('Comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Post, (p) => p.comments, { eager: true, onDelete: 'CASCADE' })
  post: Post;
  @Column()
  postId: number;
  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  user: UserEntity;
  @Column()
  userId: number;
  @OneToMany(() => LikeComment, (l) => l.comment, { eager: true, cascade: true, onDelete: 'CASCADE' })
  likes: LikeComment[];

  @Column()
  content: string;
  @Column()
  createdAt: Date;

  createLike(user: UserEntity, comment: Comment, likeStatus: LikeStatuses): LikeComment {
    const like = new LikeComment();

    like.user = user;
    like.comment = this;
    like.comment = comment;
    like.addedAt = new Date();
    like.status = likeStatus;

    return like;
  }
}
