import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class BlogBanInfo {
  @PrimaryColumn()
  blogId: number;
  @OneToOne(() => Blog, (b) => b.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blog;

  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date | null;
}
