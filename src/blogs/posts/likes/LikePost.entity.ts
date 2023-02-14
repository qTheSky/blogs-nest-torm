import { Like } from '../common/like.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Post } from '../entities/post.entity';

@Entity()
export class LikePost extends Like {
  @Column()
  postId: number;
  @ManyToOne(() => Post, (p) => p.likes)
  post: Post;
}
