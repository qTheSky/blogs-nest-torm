import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UpdateBlogModel } from '../../models/UpdateBlogModel';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs.repository';

export class UpdateBlogCommand {
  constructor(public blogId: Types.ObjectId, public userId: Types.ObjectId, public updateBlogModel: UpdateBlogModel) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.get(command.blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exits');
    if (!blog.userId.equals(command.userId)) throw new ForbiddenException();
    blog.websiteUrl = command.updateBlogModel.websiteUrl;
    blog.name = command.updateBlogModel.name;
    blog.description = command.updateBlogModel.description;
    await this.blogsRepository.save(blog);
  }
}
