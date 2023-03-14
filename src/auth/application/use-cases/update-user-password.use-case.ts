import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../../users/users.repo';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service';

export class UpdateUserPasswordCommand {
  constructor(public passwordRecoveryCode: string, public newPassword: string) {}
}

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordUseCase implements ICommandHandler<UpdateUserPasswordCommand> {
  constructor(private usersRepo: UsersRepo, private authService: AuthService) {}
  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const user = await this.usersRepo.findUserByPasswordRecoveryCode(command.passwordRecoveryCode);
    if (!user) throw new NotFoundException('User with this code not found');
    if (!user.isNewPasswordCanBeSet(command.passwordRecoveryCode)) throw new ForbiddenException('Code is wrong.');
    const newPasswordHash = await this.authService.generateHash(command.newPassword);
    user.updatePasswordHash(newPasswordHash, command.passwordRecoveryCode);
    user.makePasswordRecoveryCodeUsed();
    await this.usersRepo.save(user);
  }
}
