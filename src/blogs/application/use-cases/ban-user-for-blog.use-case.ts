import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserForBlogModel } from '../../models/BanUserForBlogModel';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BannedUsersInBlogsRepository } from '../../banned-users-in-blogs.repository';
import { UsersRepository } from '../../../users/users.repository';

export class BanUserForBlogCommand {
  constructor(
    public currentUserId: Types.ObjectId,
    public banUserForBlogModel: BanUserForBlogModel,
    public userIdForBan: Types.ObjectId,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private bannedUsersInBlogsRepository: BannedUsersInBlogsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async execute(command: BanUserForBlogCommand): Promise<void> {
    const { blogId, isBanned, banReason } = command.banUserForBlogModel;
    const blog = await this.blogsRepository.get(blogId);
    if (!blog) throw new NotFoundException();
    if (!blog.userId.equals(command.currentUserId)) throw new ForbiddenException();
    const user = await this.usersRepository.findUserById(command.userIdForBan);
    if (!user) throw new NotFoundException();
    const bannedUser = await this.bannedUsersInBlogsRepository.findBannedUser(blog._id, user._id);
    if (!bannedUser && isBanned === true) {
      await this.bannedUsersInBlogsRepository.create(blog, user._id, user.accountData.login, banReason);
      return;
    }
    if (bannedUser && isBanned === false) {
      await this.bannedUsersInBlogsRepository.deleteBannedUser(blog._id, user._id);
      return;
    }
  }
}
