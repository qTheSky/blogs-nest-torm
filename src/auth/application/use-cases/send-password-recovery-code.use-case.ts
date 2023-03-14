import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/users.repo';
import { EmailsManager } from '../../../shared/managers/emails-manager';

export class SendPasswordRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeUseCase implements ICommandHandler<SendPasswordRecoveryCodeCommand> {
  constructor(private usersRepo: UsersRepo, private emailsManager: EmailsManager) {}

  async execute(command: SendPasswordRecoveryCodeCommand) {
    const user = await this.usersRepo.findUserByLoginOrEmail(command.email);
    if (!user) return;
    const recoveryCode = user.createPasswordRecovery();
    this.emailsManager.sendPasswordRecoveryCode(user.email, recoveryCode);
    await this.usersRepo.save(user);
  }
}
