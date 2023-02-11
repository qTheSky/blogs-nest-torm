import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlogBanInfo } from './blog-ban-info.entity';
import { CreateBlogModel } from '../models/CreateBlogModel';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  user: User;
  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => BlogBanInfo, (banInfo) => banInfo.blog, { eager: true, cascade: true, onDelete: 'CASCADE' })
  banInfo: BlogBanInfo;

  ban() {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
  }

  unBan() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
  }

  public static create(user: User, dto: CreateBlogModel): Blog {
    const blog = new Blog();
    blog.user = user;

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();

    const banInfo = new BlogBanInfo();
    banInfo.isBanned = false;
    banInfo.banDate = null;

    blog.banInfo = banInfo;
    return blog;
  }
}
