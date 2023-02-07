import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { User } from '../../../users/user.schema';
import { SessionsService } from '../../../security/sessions.service';

export class LoginCommand {
  constructor(public user: User, public ip: string, public deviceName: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(private authService: AuthService, private sessionsService: SessionsService) {}

  async execute(command: LoginCommand): Promise<{ refreshToken: string; accessToken: string }> {
    const { refreshToken, accessToken } = await this.authService.generateTokens(command.user._id);
    await this.sessionsService.createSession(
      { userId: command.user._id, ip: command.ip, deviceName: command.deviceName },
      refreshToken,
    );
    return { accessToken, refreshToken };
  }
}
