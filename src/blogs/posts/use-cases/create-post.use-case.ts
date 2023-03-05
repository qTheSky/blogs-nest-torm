import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePostModel } from '../models/CreatePostModel';
import { BlogsRepo } from '../../blogs.repo';
import { PostsRepo } from '../posts.repo';
import { Post } from '../entities/post.entity';
import { UsersRepo } from '../../../users/users.repo';

export class CreatePostCommand {
  constructor(public blogId: number, public userId: number, public createPostModel: CreatePostModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private blogsRepo: BlogsRepo, private postsRepo: PostsRepo, private usersRepo: UsersRepo) {}

  async execute(command: CreatePostCommand): Promise<Post> {
    const blog = await this.blogsRepo.get(command.blogId);
    const user = await this.usersRepo.findUserById(command.userId);
    if (!blog) throw new NotFoundException('Blog not found');
    if (blog.userId !== command.userId) throw new ForbiddenException('You cant create post inside not your blog');
    return await this.postsRepo.create(blog, user, command.createPostModel);
  }
}
