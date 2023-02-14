import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlogBanInfo } from './blog-ban-info.entity';
import { CreateBlogModel } from '../models/CreateBlogModel';
import { Post } from '../posts/entities/post.entity';
import { CreatePostModel } from '../posts/models/CreatePostModel';
import { BannedUserInBlog } from './banned-user-in-blog.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;
  @Column({ nullable: true })
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

  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];

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

  createPost(user: User, blog: Blog, dto: CreatePostModel): Post {
    const post = new Post();
    post.user = user;
    post.blog = blog;
    post.createdAt = new Date();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;

    post.likes = [];

    return post;
  }

  createBannedUser(blog: Blog, dto: { user: User; banReason: string }): BannedUserInBlog {
    const bannedUser = new BannedUserInBlog();

    bannedUser.userId = dto.user.id;
    bannedUser.banReason = dto.banReason;
    bannedUser.login = dto.user.login;
    bannedUser.createdAt = new Date(); // ban date
    bannedUser.blog = blog;

    return bannedUser;
  }
}
