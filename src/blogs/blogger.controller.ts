import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CreateBlogModel } from './models/CreateBlogModel';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { BlogViewModel } from './models/BlogViewModel';
import { CreateBlogCommand } from './application/use-cases/create-blog.use-case';
import { Blog } from './blog.schema';
import { ViewModelMapper } from '../common/view-model-mapper';
import { CommandBus } from '@nestjs/cqrs';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id-pipe';
import { Types } from 'mongoose';
import { DeleteBlogCommand } from './application/use-cases/delete-blog.use-case';
import { UpdateBlogModel } from './models/UpdateBlogModel';
import { UpdateBlogCommand } from './application/use-cases/update-blog.use-case';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { BlogsQueryRepository } from './blogs.query.repository';
import { QueryBlogModel } from './models/QueryBlogModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { CreatePostByBlogIdInParamsModel } from '../posts/models/CreatePostByBlogIdInParamsModel';
import { PostViewModel } from '../posts/models/PostViewModel';
import { CreatePostCommand } from '../posts/use-cases/create-post.use-case';
import { DeletePostCommand } from '../posts/use-cases/delete-post.use-case';
import { UpdatePostCommand } from '../posts/use-cases/update-post.use-case';
import { UpdatePostModel } from '../posts/models/UpdatePostModel';
import { BanUserForBlogModel } from './models/BanUserForBlogModel';
import { BanUserForBlogCommand } from './application/use-cases/ban-user-for-blog.use-case';
import { CommentForBloggerViewModel } from '../posts/comments/models/CommentViewModel';
import { QueryCommentModel } from '../posts/comments/models/QueryCommentModel';
import { CommentsQueryRepository } from '../posts/comments/comments.query.repository';
import { BannedUserInBlogQueryModel } from './models/BannedUserInBlogQueryModel';
import { BannedUserInBlogViewModel } from './models/BannedUserInBlogViewModel';
import { BannedUsersInBlogQueryRepository } from './banned-users-in-blog.query.repository';
import { BlogsRepository } from './blogs.repository';

@Controller('blogger')
export class BloggerController {
  constructor(
    private viewModelMapper: ViewModelMapper,
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private queryNormalizer: QueryNormalizer,
    private bannedUsersInBlogQueryRepository: BannedUsersInBlogQueryRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  @Get('/blogs/comments')
  @UseGuards(JwtAuthGuard)
  async getAllCommentsForPostsOfBlogger(
    @CurrentUserId() currentUserId,
    @Query() query: QueryCommentModel,
  ): Promise<PaginatorResponseType<CommentForBloggerViewModel[]>> {
    const normalizedCommentsQuery = this.queryNormalizer.normalizeCommentsQuery(query);
    const commentsWithPaging = await this.commentsQueryRepository.findComments(normalizedCommentsQuery, {
      forBloggerId: currentUserId,
    });
    const commentsViewModels = await this.viewModelMapper.getCommentsForBloggerViewModels(
      commentsWithPaging.items,
      currentUserId,
    );
    return { ...commentsWithPaging, items: commentsViewModels };
  }

  @Put('/blogs/:blogId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @Param('blogId', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() updateBlogModel: UpdateBlogModel,
    @CurrentUserId() currentUserId,
  ): Promise<void> {
    await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(blogId, currentUserId, updateBlogModel),
    );
  }

  @Delete('/blogs/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @CurrentUserId() currentUserId,
  ): Promise<void> {
    await this.commandBus.execute<DeleteBlogCommand, void>(new DeleteBlogCommand(currentUserId, blogId));
  }

  @Post('/blogs')
  @UseGuards(JwtAuthGuard)
  async createBlog(@Body() createBlogModel: CreateBlogModel, @CurrentUserId() currentUserId): Promise<BlogViewModel> {
    const createdBlog = await this.commandBus.execute<CreateBlogCommand, Blog>(
      new CreateBlogCommand(currentUserId, createBlogModel),
    );
    return this.viewModelMapper.getBlogViewModel(createdBlog);
  }

  @Get('/blogs')
  @UseGuards(JwtAuthGuard)
  async getOwnBlogs(
    @Query() query: QueryBlogModel,
    @CurrentUserId() currentUserId,
  ): Promise<PaginatorResponseType<BlogViewModel[]>> {
    const normalizedBlogQuery = this.queryNormalizer.normalizeBlogsQuery(query);
    const foundBlogsWithPagination = await this.blogsQueryRepository.findBlogs(normalizedBlogQuery, {
      blogsOfSpecifiedUserId: currentUserId,
    });
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelMapper.getBlogViewModel),
    };
  }

  // POSTS FOR BLOG
  @Post('/blogs/:id/posts')
  @UseGuards(JwtAuthGuard)
  async createPostForBlog(
    @Param('id', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Body() createPostModel: CreatePostByBlogIdInParamsModel,
    @CurrentUserId() currentUserId,
  ): Promise<PostViewModel> {
    const createdPost = await this.commandBus.execute(
      new CreatePostCommand(currentUserId, { ...createPostModel, blogId }),
    );
    return this.viewModelMapper.getPostViewModel(createdPost, null);
  }

  @Put('/blogs/:blogId/posts/:postId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updatePost(
    @CurrentUserId() currentUserId,
    @Param('blogId', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Param('postId', ParseObjectIdPipe) postId: Types.ObjectId,
    @Body() updatePostModel: UpdatePostModel,
  ): Promise<void> {
    await this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(currentUserId, blogId, postId, updatePostModel),
    );
  }

  @Delete('/blogs/:blogId/posts/:postId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deletePost(
    @CurrentUserId() currentUserId,
    @Param('blogId', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Param('postId', ParseObjectIdPipe) postId: Types.ObjectId,
  ): Promise<void> {
    await this.commandBus.execute<DeletePostCommand, void>(new DeletePostCommand(blogId, postId, currentUserId));
  }
  // POSTS FOR BLOG

  // USERS
  @Put('/users/:userId/ban')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async banUserForBlog(
    @Param('userId', ParseObjectIdPipe) userId: Types.ObjectId,
    @Body() banUserForBlogModel: BanUserForBlogModel,
    @CurrentUserId() currentUserId,
  ): Promise<void> {
    await this.commandBus.execute<BanUserForBlogCommand, void>(
      new BanUserForBlogCommand(currentUserId, banUserForBlogModel, userId),
    );
  }

  @Get('/users/blog/:blogId')
  @UseGuards(JwtAuthGuard)
  async findBannedUsersOfSpecifiedBlog(
    @Param('blogId', ParseObjectIdPipe) blogId: Types.ObjectId,
    @Query() query: BannedUserInBlogQueryModel,
    @CurrentUserId() currentUserId,
  ): Promise<PaginatorResponseType<BannedUserInBlogViewModel[]>> {
    const blog = await this.blogsRepository.get(blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    if (!blog.userId.equals(currentUserId)) throw new ForbiddenException();
    const normalizedBannedUsersInBlogQuery = this.queryNormalizer.normalizeBannedUsersInBlogQuery(query);
    return this.bannedUsersInBlogQueryRepository.findUsers(normalizedBannedUsersInBlogQuery, blog._id);
  }
  // USERS
}
