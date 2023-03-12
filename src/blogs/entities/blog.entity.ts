import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BlogBanInfo } from './blog-ban-info.entity';
import { CreateBlogModel } from '../models/CreateBlogModel';
import { PostEntity } from '../posts/entities/post.entity';
import { CreatePostModel } from '../posts/models/CreatePostModel';
import { BannedUserInBlog } from './banned-user-in-blog.entity';
import { UploadedImageInDB } from '../../shared/types/UploadedImageDBType';

@Entity('Blogs')
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  user: UserEntity;
  @Column({ nullable: true })
  userId: number;
  @OneToMany(() => PostEntity, (p) => p.blog)
  posts: PostEntity[];
  @OneToOne(() => BlogBanInfo, (banInfo) => banInfo.blog, { eager: true, cascade: true, onDelete: 'CASCADE' })
  banInfo: BlogBanInfo;

  @Column({ collation: 'C' })
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  isMembership: boolean;
  @Column({
    nullable: true,
    type: 'json',
    transformer: {
      to: (value: object) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  mainImage: UploadedImageInDB | null;
  @Column({
    nullable: true,
    type: 'json',
    transformer: {
      to: (value: object) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  wallpaper: UploadedImageInDB | null;

  ban() {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
  }

  unBan() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
  }

  public static create(user: UserEntity, dto: CreateBlogModel): BlogEntity {
    const blog = new BlogEntity();
    blog.user = user;

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.mainImage = null;

    const banInfo = new BlogBanInfo();
    banInfo.isBanned = false;
    banInfo.banDate = null;
    blog.banInfo = banInfo;

    return blog;
  }

  createPost(user: UserEntity, blog: BlogEntity, dto: CreatePostModel): PostEntity {
    const post = new PostEntity();
    post.user = user;
    post.blog = blog;
    post.createdAt = new Date();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;

    post.likes = [];

    return post;
  }

  createBannedUser(blog: BlogEntity, dto: { user: UserEntity; banReason: string }): BannedUserInBlog {
    const bannedUser = new BannedUserInBlog();

    bannedUser.userId = dto.user.id;
    bannedUser.banReason = dto.banReason;
    bannedUser.login = dto.user.login;
    bannedUser.createdAt = new Date(); // ban date
    bannedUser.blog = blog;

    return bannedUser;
  }
}
