import { Like } from '../common/like.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PostEntity } from '../entities/post.entity';

@Entity('LikesPost')
export class LikePost extends Like {
  @ManyToOne(() => PostEntity, (p) => p.likes, { onDelete: 'CASCADE' })
  post: PostEntity;
  @Column()
  postId: number;
}
