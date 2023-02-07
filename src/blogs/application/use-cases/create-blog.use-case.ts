import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogModel } from '../../models/CreateBlogModel';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs.repository';
import { Blog } from '../../blog.schema';
import { UsersRepository } from '../../../users/users.repository';

export class CreateBlogCommand {
  constructor(public userId: Types.ObjectId, public createBlogModel: CreateBlogModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository, private usersRepository: UsersRepository) {}

  async execute(command: CreateBlogCommand): Promise<Blog> {
    const user = await this.usersRepository.findUserById(command.userId);
    return this.blogsRepository.create(command.userId, user.accountData.login, command.createBlogModel);
  }
}
