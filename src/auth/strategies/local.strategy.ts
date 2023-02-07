import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthCredentialsModel } from '../models/AuthCredentialsModel';
import { UserDocument } from '../../users/user.schema';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepository: UsersRepository) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.checkAuthCredentials({ loginOrEmail, password });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async checkAuthCredentials(authCredentialsModel: AuthCredentialsModel): Promise<UserDocument> {
    const { loginOrEmail, password } = authCredentialsModel;
    const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!user) throw new UnauthorizedException('Incorrect credentials');
    if (!user.emailConfirmation.isConfirmed) throw new UnauthorizedException('Confirm your email first');
    if (user.banInfo.isBanned) throw new UnauthorizedException();
    const isHashesEquals = await bcrypt.compare(password, user.accountData.passwordHash);
    if (!isHashesEquals) throw new UnauthorizedException('Incorrect credentials');
    return user;
  }
}
