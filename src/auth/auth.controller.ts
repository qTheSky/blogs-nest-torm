import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserModel } from '../users/models/CreateUserModel';
import { ConfirmationCodeModel } from './models/ConfirmationCodeModel';
import { EmailResendModel } from './models/EmailResendModel';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { CurrentUserId } from './decorators/current-user-id.param.decorator';
import { ConfirmEmailCommand } from './application/use-cases/confirm-email-use-case';
import { RegistrationCommand } from './application/use-cases/registration-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateEmailConfirmationCodeCommand } from './application/use-cases/update-email-confirmation-code.use-case';
import { LogoutCommand } from './application/use-cases/logout.use-case';
import { RefreshTokenCommand } from './application/use-cases/refresh-token.use-case';
import { LoginCommand } from './application/use-cases/login.use-case';
import { AuthUserDataModel } from './models/AuthUserDataModel';
import { GetAuthUserDataCommand } from './application/use-cases/get-auth-user-data.use-case';
import { User } from '../users/entities/user.entity';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  //todo make two routes for password recovery via email and confirm password recovery
  @Post('/login')
  @Throttle(5, 10)
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(@Req() req, @Res({ passthrough: true }) res) {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      LoginCommand,
      { refreshToken: string; accessToken: string }
    >(new LoginCommand(req.user, req.ip, req.headers['user-agent']));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //todo => if developing secure false otherwise true
      maxAge: 180 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ accessToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      { refreshToken: string; accessToken: string }
    >(new RefreshTokenCommand(req.cookies.refreshToken));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //todo => if developing secure false otherwise true
      maxAge: 180 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('registration-confirmation')
  @Throttle(5, 10)
  @HttpCode(204)
  async registrationConfirmation(@Body() confirmationCodeModel: ConfirmationCodeModel): Promise<void> {
    await this.commandBus.execute<ConfirmEmailCommand, boolean>(new ConfirmEmailCommand(confirmationCodeModel.code));
  }

  @Post('registration')
  @Throttle(5, 10)
  @HttpCode(204)
  async registration(@Body() createUserModel: CreateUserModel): Promise<void> {
    const isUserCreated = await this.commandBus.execute<RegistrationCommand, User | null>(
      new RegistrationCommand(createUserModel, false),
    );
    if (!isUserCreated) throw new InternalServerErrorException('something went wrong');
    return;
  }

  @Post('/registration-email-resending')
  @Throttle(5, 10)
  @HttpCode(204)
  async resendEmailConfirmationCode(@Body() emailResendModel: EmailResendModel): Promise<void> {
    await this.commandBus.execute<UpdateEmailConfirmationCodeCommand, void>(
      new UpdateEmailConfirmationCodeCommand(emailResendModel.email),
    );
  }

  @Post('/logout')
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request): Promise<void> {
    await this.commandBus.execute<LogoutCommand, void>(new LogoutCommand(req.cookies.refreshToken));
    res.clearCookie('refreshToken');
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getAuthUserData(@CurrentUserId() currentUserId: number): Promise<AuthUserDataModel> {
    return this.commandBus.execute<GetAuthUserDataCommand, AuthUserDataModel>(
      new GetAuthUserDataCommand(currentUserId),
    );
  }
}
