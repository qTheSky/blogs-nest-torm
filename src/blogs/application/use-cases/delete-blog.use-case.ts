import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public userId: Types.ObjectId, public blogId: Types.ObjectId) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}
  async execute(command: DeleteBlogCommand) {
    const blog = await this.blogsRepository.get(command.blogId);
    if (!blog) throw new NotFoundException();
    if (!blog.userId.equals(command.userId)) throw new ForbiddenException();
    await this.blogsRepository.deleteBlog(command.blogId);
  }
}
