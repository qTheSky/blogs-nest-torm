import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts.repository';

export class DeletePostCommand {
  constructor(public blogId: Types.ObjectId, public postId: Types.ObjectId, public userId: Types.ObjectId) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private blogsRepository: BlogsRepository, private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const blog = await this.blogsRepository.get(command.blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsRepository.findById(command.postId);
    if (!post) throw new NotFoundException();
    if (!post.userId.equals(command.userId)) throw new ForbiddenException();
    await this.postsRepository.deletePost(post._id);
  }
}
