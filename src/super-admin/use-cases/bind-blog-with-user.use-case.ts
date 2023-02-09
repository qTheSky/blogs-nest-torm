import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';

export class BindBlogWithUserCommand {
  constructor(public id: Types.ObjectId, public userId: Types.ObjectId) {}
}
@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private blogsRepository: BlogsRepository, private usersRepository: UsersRepository) {}

  async execute(command: BindBlogWithUserCommand): Promise<void> {
    const blog = await this.blogsRepository.get(command.id);
    if (!blog) throw new BadRequestException([{ message: 'Blog doesnt exist', field: 'id' }]);
    if (blog.userId) throw new BadRequestException([{ message: 'Blog already bound to user', field: 'id' }]);
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new BadRequestException([{ message: 'User doesnt exist', field: 'userId' }]);
    blog.userId = user.id;
    await this.blogsRepository.save(blog);
  }
}
