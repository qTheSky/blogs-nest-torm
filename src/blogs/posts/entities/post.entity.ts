import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogEntity } from '../../entities/blog.entity';
import { UserEntity } from '../../../users/entities/user.entity';
import { LikePost } from '../likes/LikePost.entity';
import { LikeStatuses } from '../../../shared/like.types';
import { Comment } from '../comments/entities/comment.entity';
import { CreateCommentModel } from '../comments/models/CreateCommentModel';

@Entity('Posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => BlogEntity, (b) => b.posts, { eager: true, onDelete: 'CASCADE' })
  blog: BlogEntity;
  @Column()
  blogId: number;
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  user: UserEntity;
  @Column({ nullable: true })
  userId: number;
  @OneToMany(() => LikePost, (l) => l.post, { onDelete: 'CASCADE', cascade: true, eager: true })
  likes: LikePost[];
  @OneToMany(() => Comment, (c) => c.post, { cascade: true, onDelete: 'CASCADE' })
  comments: Comment[];

  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  createLike(post: Post, user: UserEntity, likeStatus: LikeStatuses): LikePost {
    const like = new LikePost();
    like.user = user;
    like.post = post;
    like.addedAt = new Date();
    like.status = likeStatus;

    return like;
  }

  createComment(user: UserEntity, post: Post, dto: CreateCommentModel): Comment {
    const comment = new Comment();
    comment.post = post;
    comment.user = user;
    comment.createdAt = new Date();
    comment.content = dto.content;

    comment.likes = [];
    return comment;
  }
}
