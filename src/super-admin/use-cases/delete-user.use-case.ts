import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepo } from '../../users/users.repo';

export class DeleteUserCommand {
  constructor(public userId: number) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepo: UsersRepo) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) throw new NotFoundException();
    await this.usersRepo.delete(user.id);
  }
}
