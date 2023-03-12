import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs.repo';
import { PostsRepo } from '../posts.repo';
import { S3StorageAdapter } from '../../../shared/adapters/s3-storage.adapter';

export class DeletePostCommand {
  constructor(public blogId: number, public postId: number, public currentUserId: number) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private blogsRepo: BlogsRepo, private postsRepo: PostsRepo, private s3StorageAdapter: S3StorageAdapter) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const blog = await this.blogsRepo.get(command.blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    const post = await this.postsRepo.get(command.postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    if (post.userId !== command.currentUserId) throw new ForbiddenException('You cant delete not your post');
    if (post.mainImages) {
      for (let i = 0; i < post.mainImages.length; i++) {
        await this.s3StorageAdapter.deleteFile(post.mainImages[i].filePath);
      }
    }
    await this.postsRepo.deletePost(post.id);
  }
}
