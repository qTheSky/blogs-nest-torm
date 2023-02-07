import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UsersRepository } from '../../users/users.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public userId: Types.ObjectId) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException();
    await this.usersRepository.deleteUser(user._id);
  }
}
