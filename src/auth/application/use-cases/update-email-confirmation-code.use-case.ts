import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { EmailsManager } from '../../../shared/managers/emails-manager';
import { UsersRepo } from '../../../users/users.repo';

export class UpdateEmailConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateEmailConfirmationCodeCommand)
export class UpdateEmailConfirmationCodeUseCase implements ICommandHandler<UpdateEmailConfirmationCodeCommand> {
  constructor(private usersRepo: UsersRepo, private emailsManager: EmailsManager) {}

  async execute(command: UpdateEmailConfirmationCodeCommand): Promise<void> {
    const user = await this.usersRepo.findUserByLoginOrEmail(command.email);
    if (!user) throw new InternalServerErrorException('User not found');
    user.updateConfirmationCode();
    await this.usersRepo.save(user);
    await this.emailsManager.sendEmailConfirmationMessage(user);
  }
}
