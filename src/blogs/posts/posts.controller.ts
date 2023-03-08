import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostViewModel } from './models/PostViewModel';
import { ViewModelMapper } from '../../shared/view-model-mapper';
import { PostsQuery } from './models/QueryPostModel';
import { CommentViewModel } from './comments/models/CommentViewModel';
import { CreateCommentModel } from './comments/models/CreateCommentModel';
import { CommentsQuery } from './comments/models/QueryCommentModel';
import { PaginatorResponseType } from '../../shared/paginator-response-type';
import { LikeModel } from '../../shared/like.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guards';
import { CurrentUserId } from '../../auth/decorators/current-user-id.param.decorator';
import { GetCurrentUserIdOrNull } from '../../auth/get-user.decorator';
import { IfAuthGuard } from '../../auth/guards/if-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './comments/use-cases/create-comment.use-case';
import { PutLikeToPostCommand } from './use-cases/put-like-to-post.use-case';
import { ParseNumberPipe } from '../../shared/pipes/parse-number-pipe';
import { PostsRepo } from './posts.repo';
import { PostsQueryRepo } from './posts.query.repo';
import { CommentsQueryRepo } from './comments/comments.query.repo';

@Controller('posts')
export class PostsController {
  constructor(
    private commentsQueryRepo: CommentsQueryRepo,
    private viewModelMapper: ViewModelMapper,
    private postsQueryRepo: PostsQueryRepo,
    private commandBus: CommandBus,
    private postsRepo: PostsRepo,
  ) {}

  @Put(':postId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async likePost(
    @Param('postId', ParseNumberPipe) postId: number,
    @Body() likeModel: LikeModel,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<PutLikeToPostCommand, void>(
      new PutLikeToPostCommand(postId, currentUserId, likeModel.likeStatus),
    );
  }

  @Get(':postId/comments')
  @UseGuards(IfAuthGuard)
  async findCommentsOfPost(
    @Param('id', ParseNumberPipe) id: number,
    @Query() query: CommentsQuery,
    @GetCurrentUserIdOrNull() currentUserId: number,
  ): Promise<PaginatorResponseType<CommentViewModel[]>> {
    const post = await this.postsRepo.findPostById(id);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const commentsWithPaging = await this.commentsQueryRepo.findComments(query, {
      forPostId: post.id,
    });
    const commentsViewModels = await this.viewModelMapper.getCommentsViewModels(
      commentsWithPaging.items,
      currentUserId,
    );
    return { ...commentsWithPaging, items: commentsViewModels };
  }

  @Post('/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('postId', ParseNumberPipe) postId: number,
    @Body() createCommentModel: CreateCommentModel,
    @CurrentUserId() currentUserId,
  ): Promise<CommentViewModel> {
    return this.commandBus.execute<CreateCommentCommand, CommentViewModel>(
      new CreateCommentCommand(postId, currentUserId, createCommentModel),
    );
  }

  @Get()
  @UseGuards(IfAuthGuard)
  async findAllPosts(@Query() query: PostsQuery, @GetCurrentUserIdOrNull() currentUserId: number | null) {
    const response = await this.postsQueryRepo.findPosts(query);
    const postsViewModels = await this.viewModelMapper.getPostsViewModels(response.items, currentUserId);
    return { ...response, items: postsViewModels };
  }

  @Get('/:id')
  @UseGuards(IfAuthGuard)
  async getPostById(
    @Param('id', ParseNumberPipe) id: number,
    @GetCurrentUserIdOrNull() currentUserId: number,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsRepo.findPostById(id);
    if (!foundPost) throw new NotFoundException('Post doesnt exist');
    return this.viewModelMapper.getPostViewModel(foundPost, currentUserId);
  }
}
