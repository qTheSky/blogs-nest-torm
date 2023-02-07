import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id-pipe';
import { Types } from 'mongoose';
import { CommentViewModel } from './models/CommentViewModel';
import { ViewModelMapper } from '../../common/view-model-mapper';
import { UpdateCommentModel } from './models/UpdateCommentModel';
import { LikeModel } from '../../common/like.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guards';
import { CurrentUserId } from '../../auth/decorators/current-user-id.param.decorator';
import { GetCurrentUserIdOrNull } from '../../auth/get-user.decorator';
import { IfAuthGuard } from '../../auth/guards/if-auth.guard';
import { UsersRepository } from '../../users/users.repository';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './use-cases/update-comment.use-case';
import { DeleteCommentCommand } from './use-cases/delete-comment.use-case';
import { CommentsRepository } from './comments.repository';
import { PutLikeToCommentCommand } from './use-cases/put-like-to-comment.use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsRepository: CommentsRepository,
    private viewModelConverter: ViewModelMapper,
    private usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  @Put('/:commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async likeComment(
    @Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId,
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
    @Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId,
    @CurrentUserId() currentUserId,
    @Body() updateCommentModel: UpdateCommentModel,
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(commentId, currentUserId, updateCommentModel),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId', ParseObjectIdPipe) commentId: Types.ObjectId,
    @CurrentUserId() currentUserId,
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand, void>(new DeleteCommentCommand(commentId, currentUserId));
  }

  @UseGuards(IfAuthGuard)
  @Get('/:id')
  async getCommentById(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @GetCurrentUserIdOrNull() currentUserId,
  ): Promise<CommentViewModel> {
    const comment = await this.commentsRepository.findCommentById(id);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    return this.viewModelConverter.getCommentViewModel(comment, currentUserId);
  }
}
