import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { CommentViewModel } from './models/CommentViewModel';
import { ViewModelMapper } from '../../../common/view-model-mapper';
import { UpdateCommentModel } from './models/UpdateCommentModel';
import { LikeModel } from '../../../common/like.types';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guards';
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator';
import { GetCurrentUserIdOrNull } from '../../../auth/get-user.decorator';
import { IfAuthGuard } from '../../../auth/guards/if-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { DeleteCommentCommand } from './use-cases/delete-comment.use-case';
import { PutLikeToCommentCommand } from './use-cases/put-like-to-comment.use-case';
import { ParseNumberPipe } from '../../../common/pipes/parse-number-pipe';
import { CommentsRepo } from './comments,repo';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsRepo: CommentsRepo,
    private viewModelConverter: ViewModelMapper,
    private commandBus: CommandBus,
  ) {}

  @Put('/:commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
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
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId', ParseNumberPipe) commentId: number,
    @CurrentUserId() currentUserId: number,
    @Body() updateCommentModel: UpdateCommentModel,
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(commentId, currentUserId, updateCommentModel),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId', ParseNumberPipe) commentId: number,
    @CurrentUserId() currentUserId: number,
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand, void>(new DeleteCommentCommand(commentId, currentUserId));
  }

  @UseGuards(IfAuthGuard)
  @Get(':id')
  async getCommentById(
    @Param('id', ParseNumberPipe) id: number,
    @GetCurrentUserIdOrNull() currentUserId: number,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsRepo.findCommentById(id);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    return this.viewModelConverter.getCommentViewModel(comment, currentUserId);
  }
}
