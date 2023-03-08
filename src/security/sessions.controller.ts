import { Controller, Delete, Get, HttpCode, Param, Req } from '@nestjs/common';
import { SessionsService } from './application/sessions.service';
import { SessionViewModel } from './models/SessionViewModel';
import { ViewModelMapper } from '../shared/view-model-mapper';
import { Request } from 'express';
import { AuthService } from '../auth/application/auth.service';
import { SessionsRepo } from './sessions.repo';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionByDeviceIdCommand } from './application/use-cases/delete-session-by-device-id-use.case';
import { DeleteSessionsExceptCurrentCommand } from './application/use-cases/delete-sessions-except-current.use-case';

@Controller('security/devices')
export class SessionsController {
  constructor(
    private sessionsRepo: SessionsRepo,
    private sessionsService: SessionsService,
    private viewModelConverter: ViewModelMapper,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getSessionsOfUser(@Req() req: Request): Promise<SessionViewModel[]> {
    const userId = this.authService.getUserIdByTokenOrThrow(req.cookies.refreshToken);
    const sessions = await this.sessionsRepo.findAllSessionsOfUser(userId);
    return sessions.map(this.viewModelConverter.getSessionViewModel);
  }

  @Delete(':deviceId')
  @HttpCode(204)
  async deleteSessionByDeviceId(@Param('deviceId') deviceId: string, @Req() req: Request): Promise<void> {
    await this.commandBus.execute<DeleteSessionByDeviceIdCommand, void>(
      new DeleteSessionByDeviceIdCommand(req.cookies.refreshToken, deviceId),
    );
  }

  @Delete()
  @HttpCode(204)
  async deleteSessionExceptCurrent(@Req() req: Request): Promise<void> {
    await this.commandBus.execute<DeleteSessionsExceptCurrentCommand, void>(
      new DeleteSessionsExceptCurrentCommand(req.cookies.refreshToken),
    );
  }
}
