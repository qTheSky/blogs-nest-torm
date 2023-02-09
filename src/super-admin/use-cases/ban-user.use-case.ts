import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BanUserModel } from '../models/BanUserModel';
import { AuthService } from '../../auth/application/auth.service';
import { CommentsRepository } from '../../posts/comments/comments.repository';
import { LikesPostsRepository } from '../../posts/likes/likesPosts.repository';
import { LikesCommentsRepository } from '../../posts/comments/likes/likesComments.repository';
import { UsersRepo } from '../../users/users.repo';
import { User } from '../../users/entities/user.entity';
import { SessionsRepo } from '../../security/sessions.repo';

export class BanUserCommand {
  constructor(public userId: number, public banUserModel: BanUserModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private usersRepo: UsersRepo,
    private sessionsRepo: SessionsRepo,
    private authService: AuthService,
    private commentsRepository: CommentsRepository,
    private likesPostsRepository: LikesPostsRepository,
    private likesCommentsRepository: LikesCommentsRepository,
  ) {}

  async execute(command: BanUserCommand): Promise<void> {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) throw new NotFoundException();

    try {
      if (command.banUserModel.isBanned === true) {
        await this.ban(user, command.banUserModel.banReason);
      }
      if (command.banUserModel.isBanned === false) {
        await this.unBan(user);
      }
      await this.usersRepo.save(user);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async ban(user: User, banReason: string) {
    user.ban(banReason);
    // await this.banSessions(user.id);
    // await this.updateIsbBannedForAllSubjects(user.id, true); // comments,likes for comments, likes for posts
  }

  async unBan(user: User) {
    user.unBan();
    // await this.updateIsbBannedForAllSubjects(user.id, false);
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

  async banSessions(userId: number) {
    const userSessions = await this.sessionsRepo.findAllSessionsOfUser(userId);
    for (let i = 0; i < userSessions.length; i++) {
      await this.authService.putRefreshTokenToBlackList(userSessions[i].refreshToken);
    }
    await this.sessionsRepo.deleteAllSessionsOfUser(userId);
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
