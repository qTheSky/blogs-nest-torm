import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostViewModel } from './models/PostViewModel';
import { ViewModelMapper } from '../../shared/view-model-mapper';
import { PostsQuery } from './models/QueryPostModel';
import { CommentViewModel } from './comments/models/CommentViewModel';
import { CreateCommentModel } from './comments/models/CreateCommentModel';
import { CommentsQuery } from './comments/models/QueryCommentModel';
import { PaginatorResponseType } from '../../shared/types/paginator-response-type';
import { LikeModel } from '../../shared/types/like.types';
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestApiExample } from '../../shared/swagger/schema/bad-request-schema-example';
import { getPaginatorExample } from '../../shared/swagger/schema/common/get-paginator-example';
import { commentViewModelExample } from '../../shared/swagger/schema/comment/comment-view-model-example';
import { postViewModelExample } from '../../shared/swagger/schema/post';

@ApiTags('Posts')
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
  @ApiOperation({ summary: 'Make like/unlike/dislike/undislike operation' })
  @ApiParam({ name: 'postId', type: 'string' })
  @ApiResponse({ status: 204 })
  @ApiBadRequestResponse({ schema: BadRequestApiExample, description: 'If the inputModel has incorrect values' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: "If post with specified id doesn't exists" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
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
  @ApiOperation({ summary: 'Returns comments for specified post' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      example: getPaginatorExample<CommentViewModel>(commentViewModelExample),
    },
  })
  @ApiNotFoundResponse({ description: "If post for passed postId doesn't exist" })
  async findCommentsOfPost(
    @Param('postId', ParseNumberPipe) id: number,
    @Query() query: CommentsQuery,
    @GetCurrentUserIdOrNull() currentUserId: number | null,
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
  @ApiOperation({ summary: 'Create new comment' })
  @ApiParam({ name: 'postId', type: 'string' })
  @ApiResponse({ status: 201, schema: { example: commentViewModelExample } })
  @ApiBadRequestResponse({ schema: BadRequestApiExample, description: 'If the inputModel has incorrect values' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: "If post with specified id doesn't exists" })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Returns all posts' })
  @ApiResponse({ status: 200, schema: { example: getPaginatorExample<PostViewModel>(postViewModelExample) } })
  @UseGuards(IfAuthGuard)
  async findAllPosts(@Query() query: PostsQuery, @GetCurrentUserIdOrNull() currentUserId: number | null) {
    const response = await this.postsQueryRepo.findPosts(query);
    const postsViewModels = await this.viewModelMapper.getPostsViewModels(response.items, currentUserId);
    return { ...response, items: postsViewModels };
  }

  @Get('/:postId')
  @ApiOperation({ summary: 'Return post by id' })
  @ApiParam({ name: 'postId', type: 'string' })
  @ApiResponse({ status: 200, schema: { example: postViewModelExample } })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @UseGuards(IfAuthGuard)
  async getPostById(
    @Param('postId', ParseNumberPipe) id: number,
    @GetCurrentUserIdOrNull() currentUserId: number,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsRepo.findPostById(id);
    if (!foundPost) throw new NotFoundException('Post doesnt exist');
    return this.viewModelMapper.getPostViewModel(foundPost, currentUserId);
  }
}
