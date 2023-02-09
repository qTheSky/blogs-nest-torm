import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../../../auth/application/auth.service';
import { SessionsRepo } from '../../sessions.repo';

export class DeleteSessionByDeviceIdCommand {
  constructor(public refreshToken: string, public deviceId: string) {}
}
@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
  constructor(private authService: AuthService, private sessionsRepo: SessionsRepo) {}
  async execute(command: DeleteSessionByDeviceIdCommand): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(command.refreshToken);
    const session = await this.sessionsRepo.findSessionByDeviceId(command.deviceId);
    if (!session) throw new NotFoundException('Session with this id doesnt exist');
    if (session.userId !== userId) throw new ForbiddenException('You cant delete not your own session');
    await this.authService.putRefreshTokenToBlackList(session.refreshToken);
    await this.sessionsRepo.deleteSessionByDeviceId(command.deviceId);
  }
}
