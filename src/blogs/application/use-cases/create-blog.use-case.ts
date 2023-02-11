import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogModel } from '../../models/CreateBlogModel';
import { UsersRepo } from '../../../users/users.repo';
import { BlogsRepo } from '../../blogs.repo';
import { Blog } from '../../entities/blog.entity';

export class CreateBlogCommand {
  constructor(public userId: number, public createBlogModel: CreateBlogModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepo: BlogsRepo, private usersRe: UsersRepo) {}

  async execute(command: CreateBlogCommand): Promise<Blog> {
    const user = await this.usersRe.findUserById(command.userId);
    return this.blogsRepo.create(user, command.createBlogModel);
  }
}
