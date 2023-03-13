import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { BlogViewModel } from './models/BlogViewModel';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { PaginatorResponseType } from '../shared/types/paginator-response-type';
import { PostViewModel } from './posts/models/PostViewModel';
import { PostsQuery } from './posts/models/QueryPostModel';
import { GetCurrentUserIdOrNull } from '../auth/get-user.decorator';
import { IfAuthGuard } from '../auth/guards/if-auth.guard';
import { ParseNumberPipe } from '../shared/pipes/parse-number-pipe';
import { BlogsRepo } from './blogs.repo';
import { BlogsQueryRepo } from './blogs.query.repo';
import { PostsQueryRepo } from './posts/posts.query.repo';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlogsQuery } from './models/BlogsQuery';
import { blogViewModelExample } from '../shared/swagger/schema/blogs/blog-view-model-example';
import { getPaginatorExample } from '../shared/swagger/schema/common/get-paginator-example';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsRepo: BlogsRepo,
    private postsQueryRepo: PostsQueryRepo,
    private viewModelMapper: ViewModelMapper,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'Returns blogs with paging' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      example: getPaginatorExample<BlogViewModel>(blogViewModelExample),
    },
  })
  async findBlogs(@Query() query: BlogsQuery): Promise<PaginatorResponseType<BlogViewModel[]>> {
    const foundBlogsWithPagination = await this.blogsQueryRepo.findBlogs(query);
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelMapper.getBlogViewModel),
    };
  }

  @Get('/:blogId/posts')
  @ApiOperation({ summary: 'Returns all posts for specified blog' })
  @ApiParam({ name: 'blogId', description: 'Existing blog id', type: 'string' })
  @UseGuards(IfAuthGuard)
  async findPostsOfBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Query() query: PostsQuery,
    @GetCurrentUserIdOrNull() currentUserId: number | null,
  ): Promise<PaginatorResponseType<PostViewModel[]>> {
    const blog = await this.blogsRepo.get(blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    const response = await this.postsQueryRepo.findPosts(query, blogId);
    const postsViewModels = await this.viewModelMapper.getPostsViewModels(response.items, currentUserId);
    return { ...response, items: postsViewModels };
  }

  @Get(':blogId')
  @ApiOperation({ summary: 'Returns blog by id' })
  @ApiParam({ name: 'blogId', description: 'Existing blog id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Success', schema: { example: blogViewModelExample } })
  async getBlogById(@Param('blogId', ParseNumberPipe) id: number): Promise<BlogViewModel> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    return this.viewModelMapper.getBlogViewModel(blog);
  }
}
