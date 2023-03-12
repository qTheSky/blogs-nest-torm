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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CreateBlogModel } from './models/CreateBlogModel';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { BlogViewModel } from './models/BlogViewModel';
import { CreateBlogCommand } from './application/use-cases/create-blog.use-case';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteBlogCommand } from './application/use-cases/delete-blog.use-case';
import { UpdateBlogModel } from './models/UpdateBlogModel';
import { UpdateBlogCommand } from './application/use-cases/update-blog.use-case';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { BlogsQuery } from './models/QueryBlogModel';
import { CreatePostModel } from './posts/models/CreatePostModel';
import { PostViewModel } from './posts/models/PostViewModel';
import { CreatePostCommand } from './posts/use-cases/create-post.use-case';
import { DeletePostCommand } from './posts/use-cases/delete-post.use-case';
import { UpdatePostCommand } from './posts/use-cases/update-post.use-case';
import { UpdatePostModel } from './posts/models/UpdatePostModel';
import { BanUserForBlogModel } from './models/BanUserForBlogModel';
import { BanUserForBlogCommand } from './application/use-cases/ban-user-for-blog.use-case';
import { CommentForBloggerViewModel } from './posts/comments/models/CommentViewModel';
import { CommentsQuery } from './posts/comments/models/QueryCommentModel';
import { BannedUsersInBlogsQuery } from './models/BannedUserInBlogQueryModel';
import { BannedUserInBlogViewModel } from './models/BannedUserInBlogViewModel';
import { BlogEntity } from './entities/blog.entity';
import { ParseNumberPipe } from '../shared/pipes/parse-number-pipe';
import { BlogsQueryRepo } from './blogs.query.repo';
import { BlogsRepo } from './blogs.repo';
import { BannedUsersInBlogQueryRepo } from './banned-users-in-blog.query.repo';
import { CommentsQueryRepo } from './posts/comments/comments.query.repo';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMainImageCommand } from './application/use-cases/upload-main-image.use-case';
import { UploadedImageViewModel } from './models/ImageViewModel';
import { UploadWallpaperCommand } from './application/use-cases/upload-wallpaper.use-case';

@UseGuards(JwtAuthGuard)
@Controller('blogger')
export class BloggerController {
  constructor(
    private viewModelMapper: ViewModelMapper,
    private blogsQueryRepo: BlogsQueryRepo,
    private commandBus: CommandBus,
    private commentsQueryRepo: CommentsQueryRepo,
    private bannedUsersInBlogQueryRepo: BannedUsersInBlogQueryRepo,
    private blogsRepo: BlogsRepo,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('blogs/:blogId/images/wallpaper')
  async uploadBlogWallpaper(
    @UploadedFile() wallpaper: Express.Multer.File,
    @CurrentUserId() currentUserId: number,
    @Param('blogId', ParseNumberPipe) blogId: number,
  ): Promise<UploadedImageViewModel> {
    return this.commandBus.execute<UploadWallpaperCommand, UploadedImageViewModel>(
      new UploadWallpaperCommand(currentUserId, blogId, wallpaper),
    );
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('blogs/:blogId/images/main')
  async uploadMainBlogImage(
    @UploadedFile() mainImage: Express.Multer.File,
    @CurrentUserId() currentUserId: number,
    @Param('blogId', ParseNumberPipe) blogId: number,
  ): Promise<UploadedImageViewModel> {
    return this.commandBus.execute<UploadMainImageCommand, UploadedImageViewModel>(
      new UploadMainImageCommand(currentUserId, blogId, mainImage),
    );
  }

  @Get('/blogs/comments')
  async getAllCommentsForPostsOfBlogger(
    @CurrentUserId() currentUserId: number,
    @Query() query: CommentsQuery,
  ): Promise<PaginatorResponseType<CommentForBloggerViewModel[]>> {
    const commentsWithPaging = await this.commentsQueryRepo.findComments(query, {
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
  async deleteBlog(
    @Param('id', ParseNumberPipe) blogId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<DeleteBlogCommand, void>(new DeleteBlogCommand(currentUserId, blogId));
  }

  @Post('/blogs')
  async createBlog(
    @Body() createBlogModel: CreateBlogModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<BlogViewModel> {
    const createdBlog = await this.commandBus.execute<CreateBlogCommand, BlogEntity>(
      new CreateBlogCommand(currentUserId, createBlogModel),
    );
    return this.viewModelMapper.getBlogViewModel(createdBlog);
  }

  @Get('blogs')
  async getOwnBlogs(
    @Query() query: BlogsQuery,
    @CurrentUserId() currentUserId: number,
  ): Promise<PaginatorResponseType<BlogViewModel[]>> {
    const foundBlogsWithPagination = await this.blogsQueryRepo.findBlogs(query, {
      blogsOfSpecifiedUserId: currentUserId,
    });
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelMapper.getBlogViewModel),
    };
  }

  // POSTS FOR BLOG
  @Post('/blogs/:blogId/posts')
  async createPostForBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Body() createPostModel: CreatePostModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<PostViewModel> {
    const createdPost = await this.commandBus.execute(new CreatePostCommand(blogId, currentUserId, createPostModel));
    return this.viewModelMapper.getPostViewModel(createdPost, null);
  }

  @Put('/blogs/:blogId/posts/:postId')
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
  async findBannedUsersOfSpecifiedBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Query() query: BannedUsersInBlogsQuery,
    @CurrentUserId() currentUserId: number,
  ): Promise<PaginatorResponseType<BannedUserInBlogViewModel[]>> {
    const blog = await this.blogsRepo.get(blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    if (blog.userId !== currentUserId) throw new ForbiddenException();
    return this.bannedUsersInBlogQueryRepo.findUsers(query, blog.id);
  }

  // USERS
}
