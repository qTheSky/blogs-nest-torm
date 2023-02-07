import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../../../users/users.repository';
import { AuthUserDataModel } from '../../models/AuthUserDataModel';

export class GetAuthUserDataCommand {
  constructor(public userId: Types.ObjectId) {}
}

@CommandHandler(GetAuthUserDataCommand)
export class GetAuthUserDataUseCase implements ICommandHandler<GetAuthUserDataCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: GetAuthUserDataCommand): Promise<AuthUserDataModel> {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new InternalServerErrorException('User not found');
    return { userId: user._id, email: user.accountData.email, login: user.accountData.login };
  }
}
