import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { BlogViewModel } from './models/BlogViewModel';
import { ViewModelMapper } from '../common/view-model-mapper';
import { QueryBlogModel } from './models/QueryBlogModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { PostViewModel } from './posts/models/PostViewModel';
import { QueryPostModel } from './posts/models/QueryPostModel';
import { GetCurrentUserIdOrNull } from '../auth/get-user.decorator';
import { IfAuthGuard } from '../auth/guards/if-auth.guard';
import { ParseNumberPipe } from '../common/pipes/parse-number-pipe';
import { BlogsRepo } from './blogs.repo';
import { BlogsQueryRepo } from './blogs.query.repo';
import { PostsQueryRepo } from './posts/posts.query.repo';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsRepo: BlogsRepo,
    private postsQueryRepo: PostsQueryRepo,
    private viewModelMapper: ViewModelMapper,
    private queryNormalizer: QueryNormalizer,
  ) {}

  //BLOGS
  @Get('')
  async findBlogs(@Query() query: QueryBlogModel): Promise<PaginatorResponseType<BlogViewModel[]>> {
    const normalizedBlogQuery = this.queryNormalizer.normalizeBlogsQuery(query);
    const foundBlogsWithPagination = await this.blogsQueryRepo.findBlogs(normalizedBlogQuery);
    return {
      ...foundBlogsWithPagination,
      items: foundBlogsWithPagination.items.map(this.viewModelMapper.getBlogViewModel),
    };
  }

  @Get(':id')
  async getBlogById(@Param('id', ParseNumberPipe) id: number): Promise<BlogViewModel> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    return this.viewModelMapper.getBlogViewModel(blog);
  }

  //BLOGS

  // POSTS FOR BLOG
  @Get('/:blogId/posts')
  @UseGuards(IfAuthGuard)
  async findPostsOfBlog(
    @Param('blogId', ParseNumberPipe) blogId: number,
    @Query() query: QueryPostModel,
    @GetCurrentUserIdOrNull() currentUserId: number,
  ): Promise<PaginatorResponseType<PostViewModel[]>> {
    const blog = await this.blogsRepo.get(blogId);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    const normalizedPostsQuery = this.queryNormalizer.normalizePostsQuery(query);
    const response = await this.postsQueryRepo.findPosts(normalizedPostsQuery, blogId);
    const postsViewModels = await this.viewModelMapper.getPostsViewModels(response.items, currentUserId);
    return { ...response, items: postsViewModels };
  }

  // POSTS FOR BLOG
}
