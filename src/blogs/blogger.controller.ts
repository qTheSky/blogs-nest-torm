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
import { ViewModelMapper } from '../common/view-model-mapper';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteBlogCommand } from './application/use-cases/delete-blog.use-case';
import { UpdateBlogModel } from './models/UpdateBlogModel';
import { UpdateBlogCommand } from './application/use-cases/update-blog.use-case';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { QueryBlogModel } from './models/QueryBlogModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { CreatePostModel } from './posts/models/CreatePostModel';
import { PostViewModel } from './posts/models/PostViewModel';
import { CreatePostCommand } from './posts/use-cases/create-post.use-case';
import { DeletePostCommand } from './posts/use-cases/delete-post.use-case';
import { UpdatePostCommand } from './posts/use-cases/update-post.use-case';
import { UpdatePostModel } from './posts/models/UpdatePostModel';
import { BanUserForBlogModel } from './models/BanUserForBlogModel';
import { BanUserForBlogCommand } from './application/use-cases/ban-user-for-blog.use-case';
import { CommentForBloggerViewModel } from './posts/comments/models/CommentViewModel';
import { QueryCommentModel } from './posts/comments/models/QueryCommentModel';
import { BannedUserInBlogQueryModel } from './models/BannedUserInBlogQueryModel';
import { BannedUserInBlogViewModel } from './models/BannedUserInBlogViewModel';
import { Blog } from './entities/blog.entity';
import { ParseNumberPipe } from '../common/pipes/parse-number-pipe';
import { BlogsQueryRepo } from './blogs.query.repo';
import { BlogsRepo } from './blogs.repo';
import { BannedUsersInBlogQueryRepo } from './banned-users-in-blog.query.repo';
import { CommentsQueryRepo } from './posts/comments/comments.query.repo';

@Controller('blogger')
export class BloggerController {
  constructor(
    private viewModelMapper: ViewModelMapper,
    private blogsQueryRepo: BlogsQueryRepo,
    private commandBus: CommandBus,
    private commentsQueryRepo: CommentsQueryRepo,
    private queryNormalizer: QueryNormalizer,
    private bannedUsersInBlogQueryRepo: BannedUsersInBlogQueryRepo,
    private blogsRepo: BlogsRepo,
  ) {}

  @Get('/blogs/comments')
  @UseGuards(JwtAuthGuard)
  async getAllCommentsForPostsOfBlogger(
    @CurrentUserId() currentUserId: number,
    @Query() query: QueryCommentModel,
  ): Promise<PaginatorResponseType<CommentForBloggerViewModel[]>> {
    const normalizedCommentsQuery = this.queryNormalizer.normalizeCommentsQuery(query);
    const commentsWithPaging = await this.commentsQueryRepo.findComments(normalizedCommentsQuery, {
      commentsOnlyForBlogsOfUserId: currentUserId,
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
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Body() updateBlogModel: UpdateBlogModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(blogId, currentUserId, updateBlogModel),
    );
  }

  @Delete('/blogs/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteBlog(
    @Param('id', ParseNumberPipe) blogId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<DeleteBlogCommand, void>(new DeleteBlogCommand(currentUserId, blogId));
  }

  @Post('/blogs')
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body() createBlogModel: CreateBlogModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<BlogViewModel> {
    const createdBlog = await this.commandBus.execute<CreateBlogCommand, Blog>(
      new CreateBlogCommand(currentUserId, createBlogModel),
    );
    return this.viewModelMapper.getBlogViewModel(createdBlog);
  }

  @Get('blogs')
  @UseGuards(JwtAuthGuard)
  async getOwnBlogs(
    @Query() query: QueryBlogModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<PaginatorResponseType<BlogViewModel[]>> {
    const normalizedBlogQuery = this.queryNormalizer.normalizeBlogsQuery(query);
    const foundBlogsWithPagination = await this.blogsQueryRepo.findBlogs(normalizedBlogQuery, {
      blogsOfSpecifiedUserId: currentUserId,
    });
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelMapper.getBlogViewModel),
    };
  }

  // POSTS FOR BLOG
  @Post('/blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostForBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Body() createPostModel: CreatePostModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<PostViewModel> {
    const createdPost = await this.commandBus.execute(new CreatePostCommand(blogId, currentUserId, createPostModel));
    return this.viewModelMapper.getPostViewModel(createdPost, null);
  }

  @Put('/blogs/:blogId/posts/:postId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updatePost(
    @CurrentUserId() currentUserId,
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Param('postId', ParseNumberPipe) postId: number,
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
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Param('postId', ParseNumberPipe) postId: number,
  ): Promise<void> {
    await this.commandBus.execute<DeletePostCommand, void>(new DeletePostCommand(blogId, postId, currentUserId));
  }

  // POSTS FOR BLOG

  // USERS
  @Put('/users/:userId/ban')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async banUserForBlog(
    @Param('userId', ParseNumberPipe) userId: number,
    @Body() banUserForBlogModel: BanUserForBlogModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<BanUserForBlogCommand, void>(
      new BanUserForBlogCommand(currentUserId, banUserForBlogModel, userId),
    );
  }

  @Get('/users/blog/:blogId')
  @UseGuards(JwtAuthGuard)
  async findBannedUsersOfSpecifiedBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Query() query: BannedUserInBlogQueryModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<PaginatorResponseType<BannedUserInBlogViewModel[]>> {
    const blog = await this.blogsRepo.get(blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    if (blog.userId !== currentUserId) throw new ForbiddenException();
    const normalizedBannedUsersInBlogQuery = this.queryNormalizer.normalizeBannedUsersInBlogQuery(query);
    return this.bannedUsersInBlogQueryRepo.findUsers(normalizedBannedUsersInBlogQuery, blog.id);
  }

  // USERS
}
