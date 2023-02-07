import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModel } from './user.schema';
import { Types } from 'mongoose';

/////MONGOOSE
@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModel) {}

  async create(email: string, login: string, passwordHash: string, isByAdmin: boolean): Promise<User> {
    const user = this.UserModel.createUser(this.UserModel, login, email, passwordHash, isByAdmin);
    return await this.save(user);
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }

  async findUserById(_id: Types.ObjectId): Promise<UserDocument | null> {
    return this.UserModel.findOne({ _id });
  }

  async deleteUser(_id: Types.ObjectId): Promise<boolean> {
    const user = await this.findUserById(_id);
    if (!user) throw new NotFoundException(`User with id ${_id} doesnt exist`);
    await user.delete();
    return true;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }],
    });
  }

  async findUserByEmailConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
  }
}

// export interface IUsersRepository {
//   create: (email: string, login: string, passwordHash: string, isByAdmin: boolean) => Promise<User>;
//   save: (user: UserDocument) => Promise<UserDocument>;
//   findUserById: (_id: Types.ObjectId) => Promise<UserDocument | null>;
//   deleteUser: (_id: Types.ObjectId) => Promise<boolean>;
//   findUserByLoginOrEmail: (loginOrEmail: string) => Promise<UserDocument | null>;
//   findUserByEmailConfirmationCode: (code: string) => Promise<UserDocument | null>;
// }
////////SQL
// @Injectable()
// export class UsersRepository implements IUsersRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async create(email: string, login: string, passwordHash: string, isByAdmin: boolean): Promise<User> {
//     const user = await this.dataSource.query(
//       `
//     INSERT INTO public."Users" ("Email", "Login", "PasswordHash")
//     VALUES ($1, $2, $3)
//     RETURNING "Id", "Email", "Login", "PasswordHash", "CreatedAt"
//     `,
//       [email, login, passwordHash],
//     );
//
//     const confirmationCode = randomUUID();
//     const expirationDate = add(new Date(), { days: 1 });
//     await this.dataSource.query(
//       `
//       INSERT INTO public."UsersEmailConfirmation" ("UserId", "Code", "ExpirationDate", "IsConfirmed")
//       VALUES($1, $2, $3, $4)
//     `,
//       [user[0].Id, confirmationCode, expirationDate, isByAdmin],
//     );
//
//     await this.dataSource.query(
//       `
//         INSERT INTO public."UsersBanInfo" ("UserId")
//         VALUES($1)
//         `,
//       [user[0].Id],
//     );
//
//     const retuning: User = {
//       _id: user[0].Id,
//       accountData: { email, login, passwordHash, createdAt: user[0].CreatedAt },
//       emailConfirmation: { isConfirmed: isByAdmin, confirmationCode, expirationDate },
//       banInfo: { isBanned: false, banReason: null, banDate: null },
//     } as User;
//     return retuning;
//   }
//
//   deleteUser(_id: Types.ObjectId): Promise<boolean> {
//     return Promise.resolve(false);
//   }
//
//   findUserByEmailConfirmationCode(code: string): Promise<UserDocument | null> {
//     return Promise.resolve(null);
//   }
//
//   findUserById(_id: Types.ObjectId): Promise<UserDocument | null> {
//     return Promise.resolve(undefined);
//   }
//
//   findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
//     return Promise.resolve(null);
//   }
//
//   save(user: UserDocument): Promise<UserDocument> {
//     return Promise.resolve(undefined);
//   }
// }
