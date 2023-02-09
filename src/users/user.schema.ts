import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

@Schema({ _id: false })
class UserAccountData {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ default: new Date(), required: true })
  createdAt: Date;
}

@Schema({ _id: false })
class UserEmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  expirationDate: Date;
  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema({ _id: false })
class UserBanInfo {
  @Prop({ default: false })
  isBanned: boolean;
  @Prop({ default: null })
  banDate: Date | null;
  @Prop({ default: null })
  banReason: string | null;
}

@Schema()
export class _User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  accountData: UserAccountData;

  @Prop({ required: true })
  emailConfirmation: UserEmailConfirmation;

  @Prop({ default: { isBanned: false, banReason: null, banDate: null }, required: true })
  banInfo: UserBanInfo;

  isEmailCanBeConfirmed(code: string): boolean {
    if (this.emailConfirmation.isConfirmed) return false;
    if (this.emailConfirmation.confirmationCode !== code) return false;
    if (this.emailConfirmation.expirationDate < new Date()) return false;
    return true;
  }

  confirmEmail(code: string) {
    if (!this.isEmailCanBeConfirmed(code)) throw new Error('cant be confirmed');
    this.emailConfirmation.isConfirmed = true;
  }

  updateConfirmationCode() {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }

  ban(banReason: string) {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = banReason;
  }

  unBan() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
    this.banInfo.banReason = null;
  }

  static createUser(
    UserModel: UserModel,
    login: string,
    email: string,
    passwordHash: string,
    isConfirmedEmail: boolean,
  ): UserDocument {
    return new UserModel({
      accountData: {
        email: email,
        login: login,
        passwordHash,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: isConfirmedEmail,
      },
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(_User);

UserSchema.methods = {
  isEmailCanBeConfirmed: _User.prototype.isEmailCanBeConfirmed,
  confirmEmail: _User.prototype.confirmEmail,
  updateConfirmationCode: _User.prototype.updateConfirmationCode,
  ban: _User.prototype.ban,
  unBan: _User.prototype.unBan,
};

const userStaticMethods: UserModelStatic = {
  createUser: _User.createUser,
};

UserSchema.statics = userStaticMethods;

type UserModelStatic = {
  createUser: (
    UserModel: UserModel,
    login: string,
    email: string,
    passwordHash: string,
    isConfirmedEmail: boolean,
  ) => UserDocument;
};

export type UserDocument = HydratedDocument<_User>;

export type UserModel = Model<UserDocument> & UserModelStatic;
