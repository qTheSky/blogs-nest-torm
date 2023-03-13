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
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { deviceViewModelExample } from '../shared/swagger/schema/devices/device-view-model-example';

@ApiTags('SecurityDevices')
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
  @ApiOperation({ summary: 'Returns all devices with active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Success', schema: { example: [deviceViewModelExample] } })
  @ApiUnauthorizedResponse({ description: 'If the JWT refreshToken inside cookie is missing, expired or incorrect' })
  async getSessionsOfUser(@Req() req: Request): Promise<SessionViewModel[]> {
    const userId = this.authService.getUserIdByTokenOrThrow(req.cookies.refreshToken);
    const sessions = await this.sessionsRepo.findAllSessionsOfUser(userId);
    return sessions.map(this.viewModelConverter.getSessionViewModel);
  }

  @Delete()
  @ApiOperation({ summary: "Terminate all other (exclude current) device's sessions" })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiUnauthorizedResponse({ description: 'If the JWT refreshToken inside cookie is missing, expired or incorrect' })
  @HttpCode(204)
  async deleteSessionExceptCurrent(@Req() req: Request): Promise<void> {
    await this.commandBus.execute<DeleteSessionsExceptCurrentCommand, void>(
      new DeleteSessionsExceptCurrentCommand(req.cookies.refreshToken),
    );
  }

  @Delete(':deviceId')
  @ApiOperation({ summary: 'Terminate specified device session' })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiUnauthorizedResponse({ description: 'If the JWT refreshToken inside cookie is missing, expired or incorrect' })
  @ApiForbiddenResponse({ description: 'If try to delete the deviceId of other user' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @HttpCode(204)
  async deleteSessionByDeviceId(@Param('deviceId') deviceId: string, @Req() req: Request): Promise<void> {
    await this.commandBus.execute<DeleteSessionByDeviceIdCommand, void>(
      new DeleteSessionByDeviceIdCommand(req.cookies.refreshToken, deviceId),
    );
  }
}
