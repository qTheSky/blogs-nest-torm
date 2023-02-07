import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { Types } from 'mongoose';
import { AccessPayload } from '../jwt.payloads';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // we get into this method 100%
  async validate(payload: AccessPayload) {
    // we can make request to DB and get necessary information about user
    // but it is a bad practice
    return { id: new Types.ObjectId(payload.userId) }; //=> good practice return only user id
    // return { userId: payload.sub, username: payload.username };
  }
}
