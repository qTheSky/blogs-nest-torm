import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs.repo';
import { PostsRepo } from '../posts.repo';

export class DeletePostCommand {
  constructor(public blogId: number, public postId: number, public currentUserId: number) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private blogsRepo: BlogsRepo, private postsRepo: PostsRepo) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsRepo.get(command.postId);
    if (!post) throw new NotFoundException();
    if (post.userId !== command.currentUserId) throw new ForbiddenException();
    await this.postsRepo.deletePost(post.id);
  }
}
