import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { AuthUserDataModel } from '../../models/AuthUserDataModel';
import { UsersRepo } from '../../../users/users.repo';

export class GetAuthUserDataCommand {
  constructor(public userId: number) {}
}

@CommandHandler(GetAuthUserDataCommand)
export class GetAuthUserDataUseCase implements ICommandHandler<GetAuthUserDataCommand> {
  constructor(private usersRepository: UsersRepo) {}

  async execute(command: GetAuthUserDataCommand): Promise<AuthUserDataModel> {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new InternalServerErrorException('User not found');
    return { userId: user.id.toString(), email: user.email, login: user.login };
  }
}
