import { AuthService } from '../auth.service';
import { EmailsManager } from '../../../common/managers/emails-manager';
import { UsersRepository } from '../../../users/users.repository';
import { CreateUserModel } from '../../../users/models/CreateUserModel';
import { User } from '../../../users/user.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegistrationCommand {
  constructor(public createUserModel: CreateUserModel, public isByAdmin: boolean) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
  constructor(
    private emailsManager: EmailsManager,
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}
  async execute(command: RegistrationCommand): Promise<User | null> {
    const passwordHash = await this.authService.generateHash(command.createUserModel.password);
    const newUser = await this.usersRepository.create(
      command.createUserModel.email,
      command.createUserModel.login,
      passwordHash,
      command.isByAdmin,
    );
    if (command.isByAdmin) return newUser;
    try {
      await this.emailsManager.sendEmailConfirmationMessage(newUser);
    } catch (e) {
      console.error(e);
      await this.usersRepository.deleteUser(newUser._id);
      return null;
    }
    return newUser;
  }
}
