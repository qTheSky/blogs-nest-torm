import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs.repo';

export class DeleteBlogCommand {
  constructor(public userId: number, public blogId: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepo: BlogsRepo) {}
  async execute(command: DeleteBlogCommand) {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId !== command.userId) throw new ForbiddenException();
    await this.blogsRepo.deleteBlog(command.blogId);
  }
}
