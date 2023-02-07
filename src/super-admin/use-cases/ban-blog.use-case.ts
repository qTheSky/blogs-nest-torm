import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../posts/posts.repository';
import { PostDocument } from '../../posts/post.schema';

export class BanBlogCommand {
  constructor(public blogId: Types.ObjectId, public banStatus: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(private blogsRepository: BlogsRepository, private postsRepository: PostsRepository) {}
  async execute(command: BanBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.get(command.blogId);
    if (!blog) throw new NotFoundException();
    const allPostsOfBlog = await this.postsRepository.findAllPostsOfBlog(blog._id);
    if (command.banStatus === true) {
      blog.ban();
      await this.changePostsBanStatus(allPostsOfBlog, true);
    }
    if (command.banStatus === false) {
      blog.unBan();
      await this.changePostsBanStatus(allPostsOfBlog, false);
    }
    await this.blogsRepository.save(blog);
  }
  async changePostsBanStatus(posts: PostDocument[], banStatus: boolean): Promise<void> {
    for (const post of posts) {
      post.isBlogBanned = banStatus;
      await this.postsRepository.save(post);
    }
  }
}
