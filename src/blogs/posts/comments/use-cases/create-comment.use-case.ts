import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCommentModel } from '../models/CreateCommentModel';
import { CommentViewModel } from '../models/CommentViewModel';
import { ViewModelMapper } from '../../../../shared/view-model-mapper';
import { BannedUsersInBlogRepo } from '../../../banned-users-in-blog.repo';
import { BlogsRepo } from '../../../blogs.repo';
import { PostsRepo } from '../../posts.repo';
import { UsersRepo } from '../../../../users/users.repo';
import { CommentsRepo } from '../comments,repo';

export class CreateCommentCommand {
  constructor(public postId: number, public userId: number, public createCommentModel: CreateCommentModel) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private blogsRepo: BlogsRepo,
    private postsRepo: PostsRepo,
    private usersRepo: UsersRepo,
    private commentsRepo: CommentsRepo,
    private viewModelConverter: ViewModelMapper,
    private bannedUsersInBlogRepo: BannedUsersInBlogRepo,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const post = await this.postsRepo.get(command.postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const blog = await this.blogsRepo.get(post.blogId);
    if (!blog) throw new InternalServerErrorException('Blog doesnt exist');
    const user = await this.usersRepo.findUserById(command.userId);
    const bannedUser = await this.bannedUsersInBlogRepo.findBannedUser(blog.id, user.id);
    if (bannedUser) throw new ForbiddenException('You are banned in this blog');
    const newComment = await this.commentsRepo.create(user, post, command.createCommentModel);
    return this.viewModelConverter.getCommentViewModel(newComment, null);
  }
}
