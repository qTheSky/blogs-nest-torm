import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../../../users/users.repository';
import { EmailsManager } from '../../../common/managers/emails-manager';

export class UpdateEmailConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateEmailConfirmationCodeCommand)
export class UpdateEmailConfirmationCodeUseCase implements ICommandHandler<UpdateEmailConfirmationCodeCommand> {
  constructor(private usersRepository: UsersRepository, private emailsManager: EmailsManager) {}

  async execute(command: UpdateEmailConfirmationCodeCommand): Promise<void> {
    const user = await this.usersRepository.findUserByLoginOrEmail(command.email);
    if (!user) throw new InternalServerErrorException('User not found');
    user.updateConfirmationCode();
    await this.usersRepository.save(user);
    await this.emailsManager.sendEmailConfirmationMessage(user);
  }
}
