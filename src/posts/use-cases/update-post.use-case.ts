import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { PostsRepository } from '../posts.repository';
import { UpdatePostModel } from '../models/UpdatePostModel';

export class UpdatePostCommand {
  constructor(
    public userId: Types.ObjectId,
    public blogId: Types.ObjectId,
    public postId: Types.ObjectId,
    public updatePostModel: UpdatePostModel,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private blogsRepository: BlogsRepository, private postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const blog = await this.blogsRepository.get(command.blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsRepository.findById(command.postId);
    if (!post) throw new NotFoundException();
    if (!post.userId.equals(command.userId)) throw new ForbiddenException();
    post.title = command.updatePostModel.title;
    post.shortDescription = command.updatePostModel.shortDescription;
    post.content = command.updatePostModel.content;
    await this.postsRepository.save(post);
  }
}
