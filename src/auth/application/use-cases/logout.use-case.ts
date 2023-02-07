import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { SessionsService } from '../../../security/sessions.service';

export class LogoutCommand {
  constructor(public refreshToken: any) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private authService: AuthService, private sessionsService: SessionsService) {}

  async execute(command: LogoutCommand): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(command.refreshToken);
    await this.authService.checkIsRefreshTokenInBlackList(userId, command.refreshToken);
    const refreshPayload = await this.authService.putRefreshTokenToBlackList(command.refreshToken);
    await this.sessionsService.deleteSessionByDeviceId(refreshPayload.deviceId, userId);
  }
}
