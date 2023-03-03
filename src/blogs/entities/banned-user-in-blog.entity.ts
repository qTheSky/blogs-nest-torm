import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BlogEntity } from './blog.entity';

@Entity('BannedUsersInBlogs')
export class BannedUserInBlog {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => BlogEntity)
  blog: BlogEntity;
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
