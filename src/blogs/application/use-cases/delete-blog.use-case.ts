import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs.repo';
import { S3StorageAdapter } from '../../../shared/adapters/s3-storage.adapter';

export class DeleteBlogCommand {
  constructor(public userId: number, public blogId: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepo: BlogsRepo, private s3StorageAdapter: S3StorageAdapter) {}
  async execute(command: DeleteBlogCommand) {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    if (blog.userId !== command.userId) throw new ForbiddenException('You cant delete not your blog');
    await this.s3StorageAdapter.deleteFile(blog.mainImage.filePath);
    await this.blogsRepo.deleteBlog(command.blogId);
  }
}
