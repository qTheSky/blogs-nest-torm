import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../entities/blog.entity';
import { User } from '../../../users/entities/user.entity';
import { LikePost } from '../likes/LikePost.entity';
import { LikeStatuses } from '../../../common/like.types';
import { Comment } from '../comments/entities/comment.entity';
import { CreateCommentModel } from '../comments/models/CreateCommentModel';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Blog, (b) => b.posts, { eager: true })
  blog: Blog;
  @Column()
  blogId: number;
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;
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

  createLike(post: Post, user: User, likeStatus: LikeStatuses): LikePost {
    const like = new LikePost();
    like.user = user;
    like.post = post;
    like.addedAt = new Date();
    like.status = likeStatus;

    return like;
  }

  createComment(user: User, post: Post, dto: CreateCommentModel): Comment {
    const comment = new Comment();
    comment.post = post;
    comment.user = user;
    comment.createdAt = new Date();
    comment.content = dto.content;

    comment.likes = [];
    return comment;
  }
}
