import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostViewModel } from './models/PostViewModel';
import { PostsService } from './posts.service';
import { ViewModelMapper } from '../common/view-model-mapper';
import { Types } from 'mongoose';
import { QueryPostModel } from './models/QueryPostModel';
import { QueryNormalizer } from '../common/query-normalizer';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentViewModel } from './comments/models/CommentViewModel';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id-pipe';
import { CommentsService } from './comments/comments.service';
import { CreateCommentModel } from './comments/models/CreateCommentModel';
import { QueryCommentModel } from './comments/models/QueryCommentModel';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { PaginatorResponseType } from '../common/paginator-response-type';
import { LikeModel } from '../common/like.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { GetCurrentUserIdOrNull } from '../auth/get-user.decorator';
import { IfAuthGuard } from '../auth/guards/if-auth.guard';
import { UsersRepository } from '../users/users.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './comments/use-cases/create-comment.use-case';
import { PostsRepository } from './posts.repository';
import { PutLikeToPostCommand } from './use-cases/put-like-to-post.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsRepository: PostsRepository,
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private viewModelMapper: ViewModelMapper,
    private queryNormalizer: QueryNormalizer,
    private postsQueryRepository: PostsQueryRepository,
    private usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  @Put('/:postId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async likePost(
    @Param('postId', ParseObjectIdPipe) postId: Types.ObjectId,
    @Body() likeModel: LikeModel,
    @CurrentUserId() currentUserId,
  ): Promise<void> {
    await this.commandBus.execute<PutLikeToPostCommand, void>(
      new PutLikeToPostCommand(postId, currentUserId, likeModel.likeStatus),
    );
  }

  @Get('/:id/comments')
  @UseGuards(IfAuthGuard)
  async findCommentsOfPost(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query() query: QueryCommentModel,
    @GetCurrentUserIdOrNull() currentUserId,
  ): Promise<PaginatorResponseType<CommentViewModel[]>> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const normalizedCommentsQuery = this.queryNormalizer.normalizeCommentsQuery(query);
    const commentsWithPaging = await this.commentsQueryRepository.findComments(normalizedCommentsQuery, {
      forPostId: post._id,
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
    @Param('postId', ParseObjectIdPipe) postId: Types.ObjectId,
    @Body() createCommentModel: CreateCommentModel,
    @CurrentUserId() currentUserId,
  ): Promise<CommentViewModel> {
    return this.commandBus.execute<CreateCommentCommand, CommentViewModel>(
      new CreateCommentCommand(postId, currentUserId, createCommentModel),
    );
  }

  @Get()
  @UseGuards(IfAuthGuard)
  async findAllPosts(@Query() query: QueryPostModel, @GetCurrentUserIdOrNull() currentUserId) {
    const normalizedPostsQuery = this.queryNormalizer.normalizePostsQuery(query);
    const response = await this.postsQueryRepository.findPosts(normalizedPostsQuery);
    const postsViewModels = await this.viewModelMapper.getPostsViewModels(response.items, currentUserId);
    return { ...response, items: postsViewModels };
  }

  @Get('/:id')
  @UseGuards(IfAuthGuard)
  async getPostById(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @GetCurrentUserIdOrNull() currentUserId,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsRepository.findById(id);
    if (!foundPost) throw new NotFoundException('Post doesnt exist');
    return this.viewModelMapper.getPostViewModel(foundPost, currentUserId);
  }
}
