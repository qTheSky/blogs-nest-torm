import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs/blogs.repo';

export class BanBlogCommand {
  constructor(public blogId: number, public banStatus: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(private blogsRepo: BlogsRepo) {}
  async execute(command: BanBlogCommand): Promise<void> {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException();
    if (command.banStatus === true) {
      blog.ban();
    }
    if (command.banStatus === false) {
      blog.unBan();
    }
    await this.blogsRepo.save(blog);
  }
}
