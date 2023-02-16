import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthCredentialsModel } from '../models/AuthCredentialsModel';
import * as bcrypt from 'bcrypt';
import { UsersRepo } from '../../users/users.repo';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepo: UsersRepo) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<User> {
    return await this.checkAuthCredentials({ loginOrEmail, password });
  }

  async checkAuthCredentials(authCredentialsModel: AuthCredentialsModel): Promise<User> {
    const { loginOrEmail, password } = authCredentialsModel;
    const user = await this.usersRepo.findUserByLoginOrEmail(loginOrEmail);
    if (!user) throw new UnauthorizedException('Incorrect credentials');
    if (!user.emailConfirmation.isConfirmed) throw new UnauthorizedException('Confirm your email first');
    if (user.banInfo.isBanned) throw new UnauthorizedException();
    const isHashesEquals = await bcrypt.compare(password, user.passwordHash);
    if (!isHashesEquals) throw new UnauthorizedException('Incorrect credentials');
    return user;
  }
}
