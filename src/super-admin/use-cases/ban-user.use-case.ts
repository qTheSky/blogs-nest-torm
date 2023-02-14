import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BanUserModel } from '../models/BanUserModel';
import { AuthService } from '../../auth/application/auth.service';
import { UsersRepo } from '../../users/users.repo';
import { User } from '../../users/entities/user.entity';
import { SessionsRepo } from '../../security/sessions.repo';

export class BanUserCommand {
  constructor(public userId: number, public banUserModel: BanUserModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(private usersRepo: UsersRepo, private sessionsRepo: SessionsRepo, private authService: AuthService) {}

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
    await this.banSessions(user.id);
  }

  async unBan(user: User) {
    user.unBan();
  }

  async banSessions(userId: number) {
    const userSessions = await this.sessionsRepo.findAllSessionsOfUser(userId);
    for (const session of userSessions) {
      await this.authService.putRefreshTokenToBlackList(session.refreshToken);
    }
    await this.sessionsRepo.deleteAllSessionsOfUser(userId);
  }
}
