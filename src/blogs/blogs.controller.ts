import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { BlogViewModel } from './models/BlogViewModel';
import { ViewModelMapper } from '../common/view-model-mapper';
import { Types } from 'mongoose';
import { QueryBlogModel } from './models/QueryBlogModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { BlogsQueryRepository } from './blogs.query.repository';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { PostViewModel } from '../posts/models/PostViewModel';
import { QueryPostModel } from '../posts/models/QueryPostModel';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id-pipe';
import { GetCurrentUserIdOrNull } from '../auth/get-user.decorator';
import { IfAuthGuard } from '../auth/guards/if-auth.guard';
import { BlogsRepository } from './blogs.repository';
import { ParseNumberPipe } from '../common/pipes/parse-number-pipe';
import { BlogsRepo } from './blogs.repo';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsRepo: BlogsRepo,
    private viewModelConverter: ViewModelMapper,
    private queryNormalizer: QueryNormalizer,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  //BLOGS
  @Get('')
  async findBlogs(
    @Query() query: QueryBlogModel, // : Promise<PaginatorResponseType<BlogViewModel[]>>
  ) {
    // const normalizedBlogQuery = this.queryNormalizer.normalizeBlogsQuery(query);
    // const foundBlogsWithPagination = await this.blogsQueryRepository.findBlogs(normalizedBlogQuery);
    // return {
    //   ...foundBlogsWithPagination,
    //   items: foundBlogsWithPagination.items.map(this.viewModelConverter.getBlogViewModel),
    // };
  }

  @Get(':id')
  async getBlogById(@Param('id', ParseNumberPipe) id: number): Promise<BlogViewModel> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    return this.viewModelConverter.getBlogViewModel(blog);
  }

  //BLOGS

  // POSTS FOR BLOG
  @Get('/:id/posts')
  @UseGuards(IfAuthGuard)
  async findPostsOfBlog(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query() query: QueryPostModel,
    @GetCurrentUserIdOrNull() currentUserId,
  ): Promise<PaginatorResponseType<PostViewModel[]>> {
    const blog = await this.blogsRepository.get(id);
    if (!blog) throw new NotFoundException('Blog doesnt exist');
    const normalizedPostsQuery = this.queryNormalizer.normalizePostsQuery(query);
    const response = await this.postsQueryRepository.findPosts(normalizedPostsQuery, new Types.ObjectId(id));
    const postsViewModels = await this.viewModelConverter.getPostsViewModels(response.items, currentUserId);
    return { ...response, items: postsViewModels };
  }

  // POSTS FOR BLOG
}
