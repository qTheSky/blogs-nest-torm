import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../../auth/application/auth.service';
import { RefreshPayload } from '../../../auth/jwt.payloads';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepo } from '../../sessions.repo';

export class DeleteSessionsExceptCurrentCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteSessionsExceptCurrentCommand)
export class DeleteSessionsExceptCurrentUseCase implements ICommandHandler<DeleteSessionsExceptCurrentCommand> {
  constructor(private authService: AuthService, private jwtService: JwtService, private sessionsRepo: SessionsRepo) {}
  async execute(command: DeleteSessionsExceptCurrentCommand): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(command.refreshToken);
    const allSessionsOfUser = await this.sessionsRepo.findAllSessionsOfUser(userId);
    const { deviceId } = this.jwtService.decode(command.refreshToken) as RefreshPayload;
    for (const session of allSessionsOfUser) {
      if (session.deviceId !== deviceId) {
        await this.authService.putRefreshTokenToBlackList(session.refreshToken);
      }
    }
    await this.sessionsRepo.deleteSessionsExceptCurrent(userId, deviceId);
  }
}
