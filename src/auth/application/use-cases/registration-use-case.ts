import { AuthService } from '../auth.service';
import { EmailsManager } from '../../../common/managers/emails-manager';
import { CreateUserModel } from '../../../users/models/CreateUserModel';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/users.repo';
import { UserEntity } from '../../../users/entities/user.entity';

export class RegistrationCommand {
  constructor(public createUserModel: CreateUserModel, public isByAdmin: boolean) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
  constructor(private emailsManager: EmailsManager, private usersRepo: UsersRepo, private authService: AuthService) {}
  async execute(command: RegistrationCommand): Promise<UserEntity | null> {
    const { password, login, email } = command.createUserModel;
    const passwordHash = await this.authService.generateHash(password);
    const newUser = await this.usersRepo.create({ login, email, passwordHash, isConfirmedEmail: command.isByAdmin });
    if (command.isByAdmin) return newUser;
    try {
      await this.emailsManager.sendEmailConfirmationMessage(newUser);
    } catch (e) {
      console.error(e);
      await this.usersRepo.delete(newUser.id);
      return null;
    }
    return newUser;
  }
}
