import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { CommentViewModel } from './models/CommentViewModel';
import { ViewModelMapper } from '../../../shared/view-model-mapper';
import { UpdateCommentModel } from './models/UpdateCommentModel';
import { LikeModel } from '../../../shared/types/like.types';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guards';
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator';
import { GetCurrentUserIdOrNull } from '../../../auth/get-user.decorator';
import { IfAuthGuard } from '../../../auth/guards/if-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { DeleteCommentCommand } from './use-cases/delete-comment.use-case';
import { PutLikeToCommentCommand } from './use-cases/put-like-to-comment.use-case';
import { ParseNumberPipe } from '../../../shared/pipes/parse-number-pipe';
import { CommentsRepo } from './comments,repo';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestApiExample } from '../../../shared/swagger/schema/bad-request-schema-example';
import { unauthorizedSwaggerMessage } from '../../../shared/swagger/constants/unauthorized-swagger-message';
import { commentViewModelExample } from '../../../shared/swagger/schema/comment/comment-view-model-example';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private commentsRepo: CommentsRepo,
    private viewModelConverter: ViewModelMapper,
    private commandBus: CommandBus,
  ) {}

  @Put('/:commentId/like-status')
  @ApiOperation({ summary: 'Make like/unlike/dislike/undislike operation' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 204 })
  @ApiBadRequestResponse({ schema: BadRequestApiExample, description: 'If the inputModel has incorrect values' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: "If comment with specified id doesn't exists" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async likeComment(
    @Param('commentId', ParseNumberPipe) commentId: number,
    @Body() likeModel: LikeModel,
    @CurrentUserId() currentUserId,
  ): Promise<void> {
    await this.commandBus.execute<PutLikeToCommentCommand, void>(
      new PutLikeToCommentCommand(commentId, currentUserId, likeModel.likeStatus),
    );
  }

  @Put('/:commentId')
  @ApiOperation({ summary: 'Update existing comment by id with InputModel' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiBadRequestResponse({
    schema: BadRequestApiExample,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'If try edit the comment that is not your own' })
  @ApiNotFoundResponse({ description: 'If comment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('commentId', ParseNumberPipe) commentId: number,
    @CurrentUserId() currentUserId: number,
    @Body() updateCommentModel: UpdateCommentModel,
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(commentId, currentUserId, updateCommentModel),
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete specified comment by id' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({ description: 'If try delete the comment that is not your own' })
  @ApiNotFoundResponse({ description: 'If comment not found' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteComment(
    @Param('commentId', ParseNumberPipe) commentId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand, void>(new DeleteCommentCommand(commentId, currentUserId));
  }

  @Get(':commentId')
  @ApiOperation({ summary: 'Return comment by id' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 200, schema: { example: commentViewModelExample } })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @UseGuards(IfAuthGuard)
  async getCommentById(
    @Param('commentId', ParseNumberPipe) id: number,
    @GetCurrentUserIdOrNull() currentUserId: number,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsRepo.findCommentById(id);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    return this.viewModelConverter.getCommentViewModel(comment, currentUserId);
  }
}
