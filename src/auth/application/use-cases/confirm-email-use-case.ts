import { UsersRepository } from '../../../users/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(command.code);
    if (!user) return false;
    if (!user.isEmailCanBeConfirmed(command.code)) return false;
    user.confirmEmail(command.code);
    await this.usersRepository.save(user);
    return true;
  }
}
