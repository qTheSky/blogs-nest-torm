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
import { BlogsQuery } from './models/BlogsQuery';
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
import { ImageViewModel, UploadedImageViewModel } from './models/ImageViewModel';
import { UploadWallpaperCommand } from './application/use-cases/upload-wallpaper.use-case';
import { UploadPostMainImageCommand } from './posts/use-cases/upload-post-main-image.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestApiExample } from '../shared/swagger/schema/bad-request-schema-example';
import { unauthorizedSwaggerMessage } from '../shared/swagger/constants/unauthorized-swagger-message';
import { getPaginatorExample } from '../shared/swagger/schema/common/get-paginator-example';
import { bannedUserInBlogExample } from '../shared/swagger/schema/blogs/banned-user-in-blog-example';
import { fileSchemaExample } from '../shared/swagger/schema/common/file-schema-example';
import { blogImagesExample } from '../shared/swagger/schema/blogs/blog-images-example';
import { commentForBlogExample } from '../shared/swagger/schema/blogs/comment-for-blog-example';
import { blogViewModelExample } from '../shared/swagger/schema/blogs/blog-view-model-example';
import { postViewModelExample } from '../shared/swagger/schema/post';

@ApiTags('Blogger')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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

  @Post('blogs/:blogId/images/wallpaper')
  @ApiOperation({
    summary:
      'Upload background wallpaper for Blog (.png or .jpg (.jpeg) file (max size is 100KB, width must be 1028, height must be 312px))',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: fileSchemaExample })
  @ApiParam({ name: 'blogId', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Uploaded image information object',
    schema: { example: blogImagesExample },
  })
  @ApiBadRequestResponse({ description: 'If file format is incorrect', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to update blog that doesn't belong to current user" })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBlogWallpaper(
    @UploadedFile() wallpaper: Express.Multer.File,
    @CurrentUserId() currentUserId: number,
    @Param('blogId', ParseNumberPipe) blogId: number,
  ): Promise<UploadedImageViewModel> {
    return this.commandBus.execute<UploadWallpaperCommand, UploadedImageViewModel>(
      new UploadWallpaperCommand(currentUserId, blogId, wallpaper),
    );
  }

  @Post('blogs/:blogId/images/main')
  @ApiOperation({
    summary:
      'Upload main square image for Blog (.png or .jpg (.jpeg) file (max size is 100KB, width must be 156, height must be 156))',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: fileSchemaExample })
  @ApiParam({ name: 'blogId', type: 'string', description: 'blog id' })
  @ApiResponse({
    status: 201,
    description: 'Uploaded image information object',
    schema: { example: blogImagesExample },
  })
  @ApiBadRequestResponse({ description: 'If file format is incorrect', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to update blog that doesn't belong to current user" })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainBlogImage(
    @UploadedFile() mainImage: Express.Multer.File,
    @CurrentUserId() currentUserId: number,
    @Param('blogId', ParseNumberPipe) blogId: number,
  ): Promise<UploadedImageViewModel> {
    return this.commandBus.execute<UploadMainImageCommand, UploadedImageViewModel>(
      new UploadMainImageCommand(currentUserId, blogId, mainImage),
    );
  }

  @Post('blogs/:blogId/posts/:postId/images/main')
  @ApiOperation({
    summary:
      'Upload main image for Post (.png or .jpg (.jpeg) file (max size is 100KB, width must be 940, height must be 432))',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: fileSchemaExample })
  @ApiResponse({
    status: 201,
    description: 'Uploaded image information object',
    schema: { example: blogImagesExample },
  })
  @ApiBadRequestResponse({ description: 'If file format is incorrect', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to update blog that doesn't belong to current user" })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPostMainImage(
    @UploadedFile() postMainImage: Express.Multer.File,
    @CurrentUserId() currentUserId: number,
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Param('postId', ParseNumberPipe) postId: number,
  ): Promise<{ main: ImageViewModel[] }> {
    return this.commandBus.execute<UploadPostMainImageCommand, { main: ImageViewModel[] }>(
      new UploadPostMainImageCommand(blogId, postId, currentUserId, postMainImage),
    );
  }

  @Get('blogs/comments')
  @ApiOperation({ summary: 'Returns all comments for all posts inside all current user blogs' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: getPaginatorExample<CommentForBloggerViewModel>(commentForBlogExample) },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
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

  @Put('blogs/:blogId')
  @ApiOperation({ summary: 'Update existing Blog by id with InputModel' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiBadRequestResponse({ description: 'If the inputModel has incorrect values', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to update blog that doesn't belong to current user" })
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

  @Delete('blogs/:blogId')
  @ApiOperation({ summary: 'Delete blog specified by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @HttpCode(204)
  async deleteBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<DeleteBlogCommand, void>(new DeleteBlogCommand(currentUserId, blogId));
  }

  @Post('blogs')
  @ApiOperation({ summary: 'Create new blog' })
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created blog',
    schema: { example: blogViewModelExample },
  })
  @ApiBadRequestResponse({ description: 'If the inputModel has incorrect values', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
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
  @ApiOperation({ summary: 'Returns blogs (for which current user is owner) with paging' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: getPaginatorExample<BlogViewModel>(blogViewModelExample) },
  })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
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
  @ApiOperation({ summary: 'Create new post for specific blog' })
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created post',
    schema: { example: postViewModelExample },
  })
  @ApiBadRequestResponse({ description: 'If the inputModel has incorrect values', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to add post to blog that doesn't belong to current user" })
  @ApiNotFoundResponse({ description: "If specific blog doesn't exists" })
  async createPostForBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Body() createPostModel: CreatePostModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<PostViewModel> {
    const createdPost = await this.commandBus.execute(new CreatePostCommand(blogId, currentUserId, createPostModel));
    return this.viewModelMapper.getPostViewModel(createdPost, null);
  }

  @Put('/blogs/:blogId/posts/:postId')
  @ApiOperation({ summary: 'Update existing post by id with InputModel' })
  @ApiResponse({ description: 'No Content', status: 204 })
  @ApiBadRequestResponse({ description: 'If the inputModel has incorrect values', schema: BadRequestApiExample })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to add post to blog that doesn't belong to current user" })
  @ApiNotFoundResponse({ description: "If specific blog doesn't exists" })
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
  @ApiOperation({ summary: 'Delete post by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: "If user try to delete post that doesn't belong to current user" })
  @ApiNotFoundResponse({ description: "If specific post or blog doesn't exists" })
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
  @ApiOperation({ summary: 'Ban/Unban user (banned user can`t comment posts for your blog)' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID that should be banned' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: { example: BadRequestApiExample },
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
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
  @ApiOperation({ summary: 'Returns all banned users for blog' })
  @ApiParam({ name: 'blogId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: getPaginatorExample<BannedUserInBlogViewModel>(bannedUserInBlogExample) },
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
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
