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
import { UserEntity } from '../users/entities/user.entity';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestApiExample } from '../shared/swagger/schema/bad-request-schema-example';
import { Throttle } from '@nestjs/throttler';
import { AuthCredentialsModel } from './models/AuthCredentialsModel';
import { tooManyRequestsMessage } from '../shared/swagger/constants/too-many-requests-message';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  //todo make two routes for password recovery via email and confirm password recovery

  @Post('login')
  @ApiOperation({
    summary: 'Try login user to the system',
  })
  @ApiBody({ description: 'Example request body', type: AuthCredentialsModel })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 8 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30d ays).',
    schema: { example: { accessToken: 'string' } },
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: BadRequestApiExample,
  })
  @ApiUnauthorizedResponse({ description: 'If the password or login is wrong' })
  async login(@Req() req, @Res({ passthrough: true }) res): Promise<{ accessToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      LoginCommand,
      { refreshToken: string; accessToken: string }
    >(new LoginCommand(req.user, req.ip, req.headers['user-agent']));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //todo => if developing secure false otherwise true
      maxAge: 180 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });
    return { accessToken };
  }

  @Post('refresh-token')
  @ApiOperation({
    summary:
      'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing). ' +
      'Device LastActiveDate should be overrode by issued Date of new refresh token',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 8 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30days).',
    schema: { example: { accessToken: 'string' } },
  })
  @ApiUnauthorizedResponse({
    description: 'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
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
      sameSite: 'none',
    });

    return { accessToken };
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Confirm registration.',
  })
  @ApiResponse({ status: 204, description: 'Email was verified. Account was activated' })
  @ApiBadRequestResponse({
    description: 'If the confirmation code is incorrect, expired or already been applied',
    schema: BadRequestApiExample,
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  async registrationConfirmation(@Body() confirmationCodeModel: ConfirmationCodeModel): Promise<void> {
    await this.commandBus.execute<ConfirmEmailCommand, boolean>(new ConfirmEmailCommand(confirmationCodeModel.code));
  }

  @Post('registration')
  @ApiOperation({
    summary: 'Registration in the system. Email with confirmation code will be send to passed email address.',
  })
  @ApiResponse({
    status: 204,
    description: 'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
    schema: BadRequestApiExample,
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  @HttpCode(204)
  async registration(@Body() createUserModel: CreateUserModel): Promise<void> {
    const isUserCreated = await this.commandBus.execute<RegistrationCommand, UserEntity | null>(
      new RegistrationCommand(createUserModel, false),
    );
    if (!isUserCreated) throw new InternalServerErrorException('something went wrong');
    return;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: BadRequestApiExample,
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  async resendEmailConfirmationCode(@Body() emailResendModel: EmailResendModel): Promise<void> {
    await this.commandBus.execute<UpdateEmailConfirmationCodeCommand, void>(
      new UpdateEmailConfirmationCodeCommand(emailResendModel.email),
    );
  }

  @Post('logout')
  @ApiOperation({
    summary: 'In cookie client must send correct refreshToken that will be revoked',
  })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @ApiUnauthorizedResponse({ description: 'If the JWT refreshToken inside cookie is missing, expired or incorrect' })
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request): Promise<void> {
    await this.commandBus.execute<LogoutCommand, void>(new LogoutCommand(req.cookies.refreshToken));
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get information about current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: { email: 'string', login: 'string', userId: 'string' } as AuthUserDataModel },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAuthUserData(@CurrentUserId() currentUserId: number): Promise<AuthUserDataModel> {
    return this.commandBus.execute<GetAuthUserDataCommand, AuthUserDataModel>(
      new GetAuthUserDataCommand(currentUserId),
    );
  }
}
