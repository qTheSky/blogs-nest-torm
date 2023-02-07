import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CreatePostModel } from '../models/CreatePostModel';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts.repository';
import { Post } from '../post.schema';

export class CreatePostCommand {
  constructor(public userId: Types.ObjectId, public createPostModel: CreatePostModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private blogsRepository: BlogsRepository, private postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<Post> {
    const blog = await this.blogsRepository.get(command.createPostModel.blogId);
    if (!blog) throw new NotFoundException();
    if (!blog.userId.equals(command.userId)) throw new ForbiddenException();
    return await this.postsRepository.create(command.userId, command.createPostModel, blog.name);
  }
}
