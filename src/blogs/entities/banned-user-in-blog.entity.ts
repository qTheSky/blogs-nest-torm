import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class BannedUserInBlog {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Blog)
  blog: Blog;
  @Column()
  blogId: number;

  @Column()
  userId: number;
  @Column({ collation: 'C' })
  login: string;
  @Column()
  createdAt: Date; // ban date
  @Column()
  banReason: string;
}
