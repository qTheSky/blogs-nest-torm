import { Controller, Delete, Get, HttpCode, Param, Req } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionViewModel } from './models/SessionViewModel';
import { ViewModelMapper } from '../common/view-model-mapper';
import { Request } from 'express';
import { AuthService } from '../auth/application/auth.service';
import { SessionsRepository } from './sessions.repository';

@Controller('security')
export class SessionsController {
  constructor(
    private sessionsRepository: SessionsRepository,
    private sessionsService: SessionsService,
    private viewModelConverter: ViewModelMapper,
    private authService: AuthService,
  ) {}

  @Get('/devices')
  async getSessionsOfUser(@Req() req: Request): Promise<SessionViewModel[]> {
    const userId = this.authService.getUserIdByTokenOrThrow(req.cookies.refreshToken);
    const sessions = await this.sessionsRepository.findAllSessionsOfUser(userId);
    return sessions.map(this.viewModelConverter.getSessionViewModel);
  }

  @Delete('/devices/:id')
  @HttpCode(204)
  async deleteSession(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(req.cookies.refreshToken); //todo put refreshtokens to BL when delete session
    await this.sessionsService.deleteSessionByDeviceId(id, userId);
  }

  @Delete('/devices')
  @HttpCode(204)
  async deleteSessionExceptCurrent(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(req.cookies.refreshToken); //todo put refreshtokens to BL when delete session
    await this.sessionsService.deleteSessionsExceptCurrent(userId, req.cookies.refreshToken);
  }
}
