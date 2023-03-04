import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdatePostModel } from '../models/UpdatePostModel';
import { BlogsRepo } from '../../blogs.repo';
import { PostsRepo } from '../posts.repo';

export class UpdatePostCommand {
  constructor(
    public currentUserId: number,
    public blogId: number,
    public postId: number,
    public updatePostModel: UpdatePostModel,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private blogsRepo: BlogsRepo, private postsRepo: PostsRepo) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException('Blog not found');
    const post = await this.postsRepo.get(command.postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== command.currentUserId) throw new ForbiddenException('You can`t edit not your post');
    post.title = command.updatePostModel.title;
    post.shortDescription = command.updatePostModel.shortDescription;
    post.content = command.updatePostModel.content;
    await this.postsRepo.save(post);
  }
}
