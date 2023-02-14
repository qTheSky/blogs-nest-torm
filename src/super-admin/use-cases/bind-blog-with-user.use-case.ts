import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { BlogsRepo } from '../../blogs/blogs.repo';
import { UsersRepo } from '../../users/users.repo';

export class BindBlogWithUserCommand {
  constructor(public id: number, public userId: number) {}
}
@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private blogsRepo: BlogsRepo, private usersRepo: UsersRepo) {}

  async execute(command: BindBlogWithUserCommand): Promise<void> {
    const blog = await this.blogsRepo.get(command.id);
    if (!blog) throw new BadRequestException([{ message: 'Blog doesnt exist', field: 'id' }]);
    if (blog.userId) throw new BadRequestException([{ message: 'Blog already bound to user', field: 'id' }]);
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) throw new BadRequestException([{ message: 'User doesnt exist', field: 'userId' }]);
    blog.userId = user.id;
    await this.blogsRepo.save(blog);
  }
}
