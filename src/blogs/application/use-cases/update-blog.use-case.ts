import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogModel } from '../../models/UpdateBlogModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs.repo';

export class UpdateBlogCommand {
  constructor(public blogId: number, public userId: number, public updateBlogModel: UpdateBlogModel) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepo: BlogsRepo) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exits');
    if (blog.userId !== command.userId) throw new ForbiddenException('You cant update not your blog');
    blog.websiteUrl = command.updateBlogModel.websiteUrl;
    blog.name = command.updateBlogModel.name;
    blog.description = command.updateBlogModel.description;
    await this.blogsRepo.save(blog);
  }
}
