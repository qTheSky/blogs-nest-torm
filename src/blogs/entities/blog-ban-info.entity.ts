import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BlogEntity } from './blog.entity';

@Entity('BlogsBanInfo')
export class BlogBanInfo {
  @PrimaryColumn()
  blogId: number;
  @OneToOne(() => BlogEntity, (b) => b.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: BlogEntity;

  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date | null;
}
