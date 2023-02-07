import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PostsRepository } from '../../posts.repository';
import { UsersRepository } from '../../../users/users.repository';
import { CreateCommentModel } from '../models/CreateCommentModel';
import { CommentsRepository } from '../comments.repository';
import { CommentViewModel } from '../models/CommentViewModel';
import { ViewModelMapper } from '../../../common/view-model-mapper';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { BannedUsersInBlogsRepository } from '../../../blogs/banned-users-in-blogs.repository';

export class CreateCommentCommand {
  constructor(
    public postId: Types.ObjectId,
    public userId: Types.ObjectId,
    public createCommentModel: CreateCommentModel,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
    private viewModelConverter: ViewModelMapper,
    private bannedUsersInBlogsRepository: BannedUsersInBlogsRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const post = await this.postsRepository.get(command.postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const blog = await this.blogsRepository.get(post.blogId);
    if (!blog) throw new InternalServerErrorException();
    const user = await this.usersRepository.findUserById(command.userId);
    const bannedUser = await this.bannedUsersInBlogsRepository.findBannedUser(blog._id, user._id);
    if (bannedUser) throw new ForbiddenException('You are banned in this blog');
    const createdComment = await this.commentsRepository.create({
      createCommentModel: command.createCommentModel,
      userId: user._id,
      userLogin: user.accountData.login,
      postId: post._id,
      blogOwnerId: blog.userId,
    });
    return this.viewModelConverter.getCommentViewModel(createdComment, null);
  }
}
