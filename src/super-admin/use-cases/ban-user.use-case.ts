import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/users.repository';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BanUserModel } from '../models/BanUserModel';
import { SessionsRepository } from '../../security/sessions.repository';
import { AuthService } from '../../auth/application/auth.service';
import { UserDocument } from '../../users/user.schema';
import { CommentsRepository } from '../../posts/comments/comments.repository';
import { LikesPostsRepository } from '../../posts/likes/likesPosts.repository';
import { LikesCommentsRepository } from '../../posts/comments/likes/likesComments.repository';

export class BanUserCommand {
  constructor(public userId: Types.ObjectId, public banUserModel: BanUserModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private sessionsRepository: SessionsRepository,
    private authService: AuthService,
    private commentsRepository: CommentsRepository,
    private likesPostsRepository: LikesPostsRepository,
    private likesCommentsRepository: LikesCommentsRepository,
  ) {}

  async execute(command: BanUserCommand): Promise<void> {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException();

    try {
      if (command.banUserModel.isBanned === true) {
        await this.ban(user, command.banUserModel.banReason);
      }
      if (command.banUserModel.isBanned === false) {
        await this.unBan(user);
      }
      await this.usersRepository.save(user);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async ban(user: UserDocument, banReason: string) {
    user.ban(banReason);
    await this.banSessions(user._id);
    await this.updateIsbBannedForAllSubjects(user._id, true); // comments,likes for comments, likes for posts
  }

  async unBan(user: UserDocument) {
    user.unBan();
    await this.updateIsbBannedForAllSubjects(user._id, false);
  }

  async updateIsbBannedForAllSubjects(userId: Types.ObjectId, isBanned: boolean) {
    await this.updateIsBannedForSubject<CommentsRepository>(
      userId,
      this.commentsRepository,
      'findAllCommentsOfUser',
      isBanned,
    );
    await this.updateIsBannedForSubject<LikesCommentsRepository>(
      userId,
      this.likesCommentsRepository,
      'findAllLikesOfUser',
      isBanned,
    );
    await this.updateIsBannedForSubject<LikesPostsRepository>(
      userId,
      this.likesPostsRepository,
      'findAllLikesOfUser',
      isBanned,
    );
  }

  async banSessions(userId: Types.ObjectId) {
    const userSessions = await this.sessionsRepository.findAllSessionsOfUser(userId);
    for (let i = 0; i < userSessions.length; i++) {
      await this.authService.putRefreshTokenToBlackList(userSessions[i].refreshToken);
    }
    await this.sessionsRepository.deleteAllSessionsOfUser(userId);
  }

  async updateIsBannedForSubject<R extends { save: (document: any) => any }>(
    userId: Types.ObjectId,
    repo: R,
    repositoryFindMethod: string,
    isBanned: boolean,
  ) {
    const subjects = await repo[repositoryFindMethod](userId);
    for (let i = 0; i < subjects.length; i++) {
      subjects[i].isUserBanned = isBanned;
      await repo.save(subjects[i]);
    }
  }
}
